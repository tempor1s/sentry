import express from 'express';
import passport from 'passport';
import session from 'express-session';
import connectRedis from 'connect-redis';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import path from 'path';
import { AkairoClient } from 'discord-akairo';
import { Strategy } from 'passport-discord';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import {
  discordClientSecret,
  callbackUrl,
  sessionSecret,
  serverUrl,
} from '../config';
import { redisClient } from '../structures/redis';
import { hasManageServerAndBotInGuild } from '../utils/permissions';
import { Users } from '../models/users';
import logger from '../utils/logger';

const app = express();
const RedisStore = connectRedis(session);

module.exports = async (client: AkairoClient) => {
  // common secure headers
  app.use(helmet());
  // body parser for better json parsing
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // serialize passport user and pass on to deserialize
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // TODO: Type this and refactor all of this out of here
  passport.deserializeUser(async (user: any, done) => {
    const repo = client.db.getRepository(Users);
    const currentUser = await repo.findOne({ where: { id: user.id } });

    process.nextTick(() => done(null, currentUser));
  });

  // session data
  app.use(
    session({
      name: 'sentry-session',
      store: new RedisStore({
        client: redisClient,
      }),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        // only secure in production
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );
  // passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // oauth scopes that discord that will contain information from discord
  const scopes = ['identify', 'email', 'guilds'];

  // passport strategy
  passport.use(
    new Strategy(
      {
        clientID: client.application.id,
        clientSecret: discordClientSecret,
        callbackURL: callbackUrl,
        scope: scopes,
      },
      // called after the user is created
      async (_accessToken, _refreshToken, profile, done) => {
        const repo = client.db.getRepository(Users);
        const currentUser = await repo.findOne({ where: { id: profile!.id } });

        if (currentUser) {
          // always update the guilds
          currentUser.servers = profile.guilds
            ?.filter((guild) =>
              hasManageServerAndBotInGuild(client, guild, profile.id)
            )
            .map((guild) => guild.id);

          await repo.save(currentUser);

          process.nextTick(() => done(null, currentUser));
          return;
        }

        // create a user in the db with id, email, and guilds that are managable
        let user: Users = repo.create({
          id: profile.id,
          email: profile.email,
          servers: profile.guilds
            ?.filter((guild) =>
              hasManageServerAndBotInGuild(client, guild, profile.id)
            )
            .map((guild) => guild.id),
        });

        // save user to db
        await repo.save(user);

        process.nextTick(() => done(null, user));
        return;
      }
    )
  );

  // passport auth routes that we can not use graphql for
  app.get(
    '/auth/discord',
    passport.authenticate('discord', { scope: scopes, session: true })
  );
  app.get(
    '/auth/discord/callback',
    passport.authenticate('discord', {
      successRedirect:
        process.env.NODE_ENV === 'production'
          ? 'http://sentry.benl.dev/dashboard'
          : 'http://localhost:3000/dashboard',
      failureRedirect:
        process.env.NODE_ENV === 'production'
          ? 'http://sentry.benl.dev'
          : 'http://localhost:3000',
      session: true,
    })
  );

  // graphql stuff
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [path.join(__dirname, 'resolvers') + '/**{.ts,.js}'],
    }),
    context: ({ req, res }) => {
      // context that will be passed with each graphql request
      return {
        req,
        res,
        client,
        getUser: () => req.user,
        logout: () => req.logout(),
      };
    },
    playground: {
      settings: {
        'request.credentials': 'include',
      },
    },
  });

  const corsOptions = {
    origin: [
      'http://localhost:3000',
      'http://0.0.0.0:3000',
      'http://frontend:3000',
      serverUrl,
    ],
    credentials: true,
  };

  // setup the apollo server with the app
  server.applyMiddleware({ app, cors: corsOptions });

  // start the server
  client.site = app.listen(8080, '0.0.0.0', () => {
    logger.info(
      `Server now ready at http://localhost:8080${server.graphqlPath}`
    );
  });
};

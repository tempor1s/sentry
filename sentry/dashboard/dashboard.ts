import express, { Request, Response } from 'express';
import passport from 'passport';
import session from 'express-session';
import connectRedis from 'connect-redis';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { AkairoClient } from 'discord-akairo';
import { Strategy } from 'passport-discord';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { discordClientSecret, callbackUrl, sessionSecret } from '../config';
import { redisClient } from '../structures/redis';
import { hasManageServerAndBotInGuild } from '../utils/permissions';
import { Users } from '../models/users';
import logger from '../utils/logger';

const app = express();
const RedisStore = connectRedis(session);

module.exports = async (client: AkairoClient) => {
  app.use(cors());
  // general middleware
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // TODO: Type this
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
    })
  );
  // passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

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

        console.log('user profile', 'profile');

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

        console.log(user);

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
          ? 'http://sentry.benl.dev'
          : 'http://0.0.0.0:3000/dashboard',
      failureRedirect:
        process.env.NODE_ENV === 'production'
          ? 'http://sentry.benl.dev'
          : 'http://0.0.0.0:3000',
      session: true,
    })
  );

  // graphql stuff
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [path.join(__dirname, 'resolvers') + '/**{.ts,.js}'],
    }),
    context: ({ req, res }) => {
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

  server.applyMiddleware({ app });

  app.get('/', (req: Request, res: Response) => {
    console.log(req.user);
    res.end();
  });

  client.site = app.listen(8080, '0.0.0.0', () => {
    logger.info(`Server now ready at http://0.0.0.0:8080${server.graphqlPath}`);
  });
};

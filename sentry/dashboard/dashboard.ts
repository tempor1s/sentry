import express, { Request, Response } from 'express';
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
  domain,
} from '../config';
import { redisClient } from '../structures/redis';
import { hasManageServer } from '../utils/permissions';
import { Users } from '../models/users';
import logger from '../utils/logger';
import { customAuthChecker } from './utils/auth';

const app = express();
const RedisStore = connectRedis(session);

module.exports = async (client: AkairoClient) => {
  // common secure headers
  app.use(helmet());
  // body parser for better json parsing
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.set('trust proxy', true);

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser(async (user: any, done) => {
    process.nextTick(() => done(null, user));
  });

  // session data
  app.use(
    session({
      name: 'sentry-session',
      store: new RedisStore({
        client: redisClient,
      }),
      secret: sessionSecret,
      proxy: process.env.NODE_ENV === 'production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        domain: domain,
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
      // TODO: Maybe move into .deserializeUser
      // called after the user is created
      async (_accessToken, _refreshToken, profile, done) => {
        const repo = client.db.getRepository(Users);
        const currentUser = await repo.findOne({ where: { id: profile!.id } });

        let guilds = profile.guilds
          ?.filter((guild) => hasManageServer(guild.permissions))
          .map((guild) => guild.id);

        if (currentUser) {
          // might as well update guilds
          if (guilds) {
            currentUser.servers = guilds;

            await repo.save(currentUser);
          }

          process.nextTick(() => done(null, currentUser));
          return;
        }

        // create a user in the db with id, email, and guilds that are managable
        let user: Users = repo.create({
          id: profile.id,
          email: profile.email,
          servers: guilds,
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
      authChecker: customAuthChecker,
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
      'http://0.0.0.0:3000',
      'http://0.0.0.0:8080',
      'https://sentry.benl.dev',
      'https://sentrybot.io',
      'https://api.sentrybot.io',
      'https://sentry.dev.benl.dev',
      'https://sentry-frontend.dev.benl.dev',
      serverUrl,
    ],
    credentials: true,
  };

  // basic hello world for status checks
  app.get('/', (_: Request, res: Response) => {
    res.send(':)');
  });

  // setup the apollo server with the app
  server.applyMiddleware({ app, cors: corsOptions });

  // start the server
  client.site = app.listen(8080, '0.0.0.0', () => {
    logger.info(`Server now ready at http://0.0.0.0:8080${server.graphqlPath}`);
  });
};

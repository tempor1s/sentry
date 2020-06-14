import express from 'express';
import passport from 'passport';
import session from 'express-session';
import connectRedis from 'connect-redis';
import helmet from 'helmet';
import path from 'path';
import { AkairoClient } from 'discord-akairo';
import { Strategy } from 'passport-discord';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { discordClientSecret, callbackUrl, sessionSecret } from '../config';
import logger from '../utils/logger';

const app = express();

module.exports = async (client: AkairoClient) => {
  // passport black magic
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  // passport strategy
  passport.use(
    new Strategy(
      {
        clientID: client.application.id,
        clientSecret: discordClientSecret,
        callbackURL: callbackUrl,
        scope: ['email', 'identity', 'guilds'],
      },
      (_accessToken, _refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
      }
    )
  );

  // graphql stuff
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [path.join(__dirname, 'resolvers') + '/**{.ts,.js}'],
    }),
    context: ({ req, res }) => {
      const token = req.headers.authorization || '';
      console.log(token);

      return { req, res, client };
    },
  });

  server.applyMiddleware({ app });

  // redis session store
  let RedisStore = connectRedis(session);

  // session data for logged in users :)
  app.use(
    session({
      store: new RedisStore({ client: client.cache }),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet());

  client.site = app.listen(8080, '0.0.0.0', () => {
    logger.info(`Server now ready at http://0.0.0.0:8080${server.graphqlPath}`);
  });
};

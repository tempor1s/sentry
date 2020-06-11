import { AkairoClient } from 'discord-akairo';
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import connectRedis from 'connect-redis';
import helmet from 'helmet';
import { Strategy } from 'passport-discord';
import { discordClientSecret, callbackUrl, sessionSecret } from '../config';
import logger from '../utils/logger';
import { ApolloServer, gql } from 'apollo-server-express';

const app = express();

// graphql stuff
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

module.exports = async (client: AkairoClient) => {
  // passport black magic
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  // setup callback
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

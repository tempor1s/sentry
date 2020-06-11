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
  // TODO: Move type defs and resolvers into a seperate file because its gonna get very long
  const typeDefs = gql`
    type Query {
      stats: Stats
    }

    type Stats {
      servers: Int!
      users: Int!
      channels: Int!
    }
  `;

  // TODO: A lot of this is going to need to change when sharding is added
  const resolvers = {
    Query: {
      stats: () => {
        return {
          servers: client.guilds.cache.size,
          users: client.users.cache.size,
          channels: client.channels.cache.size,
        };
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers });
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

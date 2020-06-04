import path from 'path';
import { AkairoClient } from 'discord-akairo';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import session from 'express-session';
import connectRedis from 'connect-redis';
import helmet from 'helmet';
import { Strategy } from 'passport-discord';
import {
  discordClientSecret,
  callbackUrl,
  sessionSecret,
  domain,
} from '../config';
import logger from '../utils/logger';
import bodyParser from 'body-parser';
import clientResponse from './utils/clientResponse';

const app = express();

module.exports = async (client: AkairoClient) => {
  // static public stuff
  app.use('/public', express.static(path.resolve('./public')));

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

  app.locals.domain = domain;

  // parse json or form bodys
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  // auth checks
  function checkAuth(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) return next();
    // FIXME: possible bug
    req.session!.backURL = req.url;
    res.redirect('/login');
  }

  app.get('/', (_: Request, res: Response) => {
    clientResponse(res, 200, { data: { hello: 'Hello!' } });
  });

  client.site = app.listen(8080, '0.0.0.0', () => {
    logger.info('Server now online.');
  });
};

import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { Message, Permissions, ClientApplication } from 'discord.js';
import { join } from 'path';
import { owners } from '../config';
import { getPrefix } from '../structures/prefixManager';
import { redisClient } from '../structures/redis';
import { RedisClient } from 'redis';
import { createDBConnection } from '../structures/database';
import logger from '../utils/logger';
import http from 'http';

declare module 'discord-akairo' {
  interface AkairoClient {
    commandHander: CommandHandler;
    listenerHandler: ListenerHandler;
    invite: string;
    site: http.Server;
    application: ClientApplication;
    cache: RedisClient;
  }
}

interface BotOptions {
  token?: string;
  owners?: string | string[];
}

export default class Client extends AkairoClient {
  public config: BotOptions;
  public invite!: string;
  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: join(__dirname, '..', 'listeners'),
  });
  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: join(__dirname, '..', 'commands'),
    prefix: async (msg: Message) => getPrefix(msg),
    blockBots: true,
    allowMention: true,
    commandUtil: true,
    ignorePermissions: owners,
  });

  public constructor(config: BotOptions) {
    super(
      {
        ownerID: config.owners,
        shards: 'auto',
      },
      // we may need to reduce cache size as the bot grows
      { messageCacheMaxSize: 100, disableMentions: 'everyone' }
    );

    this.config = config;
  }

  public async _init(): Promise<void> {
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler,
      process,
    });

    logger.debug('Registering command handler..');
    this.commandHandler.loadAll();
    logger.debug('Registering event listeners..');
    this.listenerHandler.loadAll();

    // Get invite
    logger.debug('Generating invite..');
    this.invite = await this.generateInvite([Permissions.FLAGS.ADMINISTRATOR]);

    // Get client application
    logger.debug('Getting Application Info..');
    this.application = await this.fetchApplication();

    // connect to the db
    logger.debug('Connecting to DB..');
    await createDBConnection();

    // initalize cache
    logger.debug('Initializing redis cache..');
    this.cache = redisClient;

    // initialize the dashboard
    logger.info('Initializing the dashboard..');
    require('../dashboard/dashboard')(this);
  }

  public async start(): Promise<string> {
    logger.info('Initializing bot services...');
    await this._init();
    return this.login(this.config.token);
  }
}

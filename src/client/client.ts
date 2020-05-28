import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { Message, Permissions, DMChannel } from 'discord.js';
import { join } from 'path';
import { owners, dbName, defaultPrefix } from '../config';
import { Connection } from 'typeorm';
import { Repository } from 'typeorm';
import { Servers } from '../models/server';
import Database from '../structures/database';
import logger from '../utils/logger';

declare module 'discord-akairo' {
  interface AkairoClient {
    commandHander: CommandHandler;
    listenerHandler: ListenerHandler;
    db: Connection;
    invite: string;
  }
}

interface BotOptions {
  token?: string;
  owners?: string | string[];
}

export default class Client extends AkairoClient {
  public config: BotOptions;
  public db: Connection = Database.get(dbName);
  public invite!: string;
  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: join(__dirname, '..', 'listeners'),
  });
  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: join(__dirname, '..', 'commands'),
    // TODO: Add LRU cache to increase speed and reduce queries
    prefix: async (msg: Message): Promise<string> => {
      if (msg.channel instanceof DMChannel) {
        return defaultPrefix;
      }

      let serverRepo: Repository<Servers> = this.db.getRepository(Servers);

      let prefix = await serverRepo
        .findOne({ where: { server: msg.guild?.id } })
        .then((server) => server?.prefix)
        // insert the server into the db if we have not seen it before
        .catch((_) => {
          let serversRepo: Repository<Servers> = this.db.getRepository(Servers);

          serversRepo.insert({ server: msg.guild!.id });

          return defaultPrefix;
        });

      return prefix || defaultPrefix;
    },
    blockBots: true,
    allowMention: true,
    commandUtil: true,
    ignorePermissions: owners,
  });

  public constructor(config: BotOptions) {
    super(
      {
        ownerID: config.owners,
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

    this.commandHandler.loadAll();
    logger.debug('Registering command handler.');
    this.listenerHandler.loadAll();
    logger.debug('Registering listeners.');

    // Get invite
    this.invite = await this.generateInvite([Permissions.FLAGS.ADMINISTRATOR]);
    logger.debug('Generating invite.');

    // conect to the db
    await this.db.connect();
    logger.debug('Connecting to DB...');
    await this.db.synchronize();
    logger.debug('Synchronizing DB..');
  }

  public async start(): Promise<string> {
    logger.info('Initializing bot services...');
    await this._init();
    return this.login(this.config.token);
  }
}

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
    public db: Connection;
    public invite: string;
    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, '..', 'listeners'),
    });
    public commandHandler: CommandHandler = new CommandHandler(this, {
        directory: join(__dirname, '..', 'commands'),
        // TODO: Add LRU cache to increase speed and reduce queries and also make this not a promise :)
        prefix: (msg: Message): Promise<string> | string => {
            if (msg.channel instanceof DMChannel) {
                return defaultPrefix;
            }

            let serverRepo: Repository<Servers> = this.db.getRepository(
                Servers
            );

            let prefix = serverRepo
                .findOne({ where: { server: msg.guild.id } })
                .then((server) => server.prefix)
                // insert the server into the db if we have not seen it before
                .catch((_) => {
                    let serversRepo: Repository<Servers> = this.db.getRepository(
                        Servers
                    );

                    serversRepo.insert({ server: msg.guild.id });

                    return defaultPrefix;
                });

            return prefix;
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
            // TODO: Reduce this when the bot grows :)
            { messageCacheMaxSize: 1000, disableMentions: 'everyone' }
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
        this.invite = await this.generateInvite([
            Permissions.FLAGS.ADMINISTRATOR,
        ]);
        logger.debug('Generating invite.');

        // Get the DB and connect/synchronize to it.
        this.db = Database.get(dbName);
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

import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import { join } from 'path';
import { owners, dbName, defaultPrefix } from '../config';
import { Connection } from 'typeorm';
import { Repository } from 'typeorm';
import { Servers } from '../models/server';
import Database from '../structures/database';

declare module 'discord-akairo' {
    interface AkairoClient {
        commandHander: CommandHandler;
        listenerHandler: ListenerHandler;
        db: Connection;
    }
}

interface BotOptions {
    token?: string;
    owners?: string | string[];
}

export default class Client extends AkairoClient {
    public config: BotOptions;
    public db: Connection;
    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, '..', 'listeners'),
    });
    public commandHandler: CommandHandler = new CommandHandler(this, {
        directory: join(__dirname, '..', 'commands'),
        // TODO: Add LRU cache to increase speed and reduce queries
        prefix: (msg: Message): string | Promise<string> => {
            let serverRepo: Repository<Servers> = this.db.getRepository(
                Servers
            );

            let prefix = serverRepo
                .findOne({ where: { id: msg.guild.id } })
                .then((server) => server.prefix)
                // insert the server into the db if we have not seen it before
                .catch((_) => {
                    let serversRepo: Repository<Servers> = this.db.getRepository(
                        Servers
                    );

                    serversRepo.insert({
                        id: msg.guild.id,
                        prefix: defaultPrefix,
                    });

                    return defaultPrefix;
                });

            return prefix;
        },
        allowMention: true,
        commandUtil: true,
        ignorePermissions: owners,
    });

    public constructor(config: BotOptions) {
        super({
            ownerID: config.owners,
        });

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
        this.listenerHandler.loadAll();

        // Get the DB and connect/synchronize to it.
        this.db = Database.get(dbName);
        await this.db.connect();
        await this.db.synchronize();
    }

    public async start(): Promise<string> {
        await this._init();
        return this.login(this.config.token);
    }
}

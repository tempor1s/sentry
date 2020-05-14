import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo'
import { User, Message } from 'discord.js'
import { join } from 'path'
import { default_prefix, owners } from '../config'

declare module 'discord-akairo' {
    interface AkairoClient {
        commandHander: CommandHandler
        listenerHandler: ListenerHandler
    }
}

interface BotOptions {
    token?: string
    owners?: string | string[]
}

export default class Client extends AkairoClient {
    public config: BotOptions
    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, '..', 'listeners'),
    })
    public commandHandler: CommandHandler = new CommandHandler(this, {
        directory: join(__dirname, '..', 'commands'),
        // TODO: Make this dynamic when I add a DB
        prefix: default_prefix,
        allowMention: true,
        commandUtil: true,
        ignorePermissions: owners,
    })

    public constructor(config: BotOptions) {
        super({
            ownerID: config.owners,
        })

        this.config = config
    }

    public async _init(): Promise<void> {
        this.commandHandler.useListenerHandler(this.listenerHandler)
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler,
            process,
        })

        this.commandHandler.loadAll()
        this.listenerHandler.loadAll()
    }

    public async start(): Promise<string> {
        await this._init()
        return this.login(this.config.token)
    }
}

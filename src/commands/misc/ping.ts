import { Command } from 'discord-akairo'
import { Message } from 'discord.js'

export default class Ping extends Command {
    public constructor() {
        super('ping', {
            aliases: ['ping', 'alive'],
            category: 'misc',
            description: {
                content:
                    'Check the latency from the client to the Discord API.',
                usage: 'ping',
                examples: ['ping'],
            },
        })
    }

    public exec(msg: Message): Promise<Message> {
        return msg.util.send(`Pong. \`${this.client.ws.ping}ms\``)
    }
}

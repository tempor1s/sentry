import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PingCommand extends Command {
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
        });
    }

    public async exec(msg: Message) {
        return msg.util?.send(`Pong. \`${this.client.ws.ping}ms\``);
    }
}

import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Repository } from 'typeorm';
import { Servers } from '../../models/server';
import { defaultPrefix } from '../../config';

export default class PrefixCommand extends Command {
    public constructor() {
        super('prefix', {
            aliases: ['prefix'],
            description: {
                content: 'View or update the prefix of the bot.',
                usage: 'prefix [prefix]',
                examples: ['', '>', 'pls'],
            },
            category: 'misc',
            channel: 'guild',
            userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
            args: [
                {
                    id: 'prefix',
                    type: 'string',
                },
            ],
        });
    }

    public async exec(msg: Message, { prefix }: { prefix: string }) {
        if (!prefix) {
            let prefix = await (this.handler.prefix as PrefixSupplier)(msg);
            return msg.util.send(
                `The current prefix for the server is \`${prefix}\``
            );
        }

        let serverRepo: Repository<Servers> = this.client.db.getRepository(
            Servers
        );

        serverRepo.update({ id: msg.guild.id }, { prefix: prefix });

        if (prefix === defaultPrefix) {
            return msg.util?.send(`Reset prefix back to \`${prefix}\``);
        }

        return msg.util?.send(`The prefix has been set to \`${prefix}\``);
    }
}


import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES } from '../../utils/constants';
import { Repository } from 'typeorm';
import { Servers } from '../../models/server';
import { defaultPrefix } from '../../config';

export default class PrefixCommand extends Command {
    public constructor() {
        super('prefix', {
            aliases: ['prefix'],
            description: {
                content: MESSAGES.COMMANDS.MISC.PREFIX,
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
            return msg.util.send(
                MESSAGES.COMMANDS.MISC.PREFIX.REPLY(
                    await (this.handler.prefix as PrefixSupplier)(msg)
                )
            );
        }

        let serverRepo: Repository<Servers> = this.client.db.getRepository(
            Servers
        );

        serverRepo.update({ id: msg.guild.id }, { prefix: prefix });

        if (prefix === defaultPrefix) {
            return msg.util?.send(
                MESSAGES.COMMANDS.MISC.PREFIX.REPLY_2(prefix)
            );
        }

        return msg.util?.send(MESSAGES.COMMANDS.MISC.PREFIX.REPLY_3(prefix));
    }
}


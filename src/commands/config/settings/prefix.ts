import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Repository } from 'typeorm';
import { Servers } from '../../../models/server';
import { defaultPrefix } from '../../../config';
import logger from '../../../utils/logger';

export default class PrefixConfigCommand extends Command {
    public constructor() {
        super('config-prefix', {
            aliases: ['prefix'],
            description: {
                content: 'View or update the prefix of the bot.',
                usage: 'prefix [prefix]',
                examples: ['', '>', 'pls'],
            },
            channel: 'guild',
            category: 'config',
            clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
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
        let serverPrefix = await (this.handler.prefix as PrefixSupplier)(msg);
        if (!prefix) {
            return msg.util?.send(
                `The current prefix for the server is \`${serverPrefix}\``
            );
        }

        let serverRepo: Repository<Servers> = this.client.db.getRepository(
            Servers
        );

        // update the prefix
        try {
            await serverRepo.update(
                { server: msg.guild.id },
                { prefix: prefix }
            );

            logger.debug(
                `Updating prefix in ${msg.guild.name} (${msg.guild.id}) from '${serverPrefix}' -> '${prefix}'`
            );
        } catch (err) {
            logger.error(
                `Error updating prefix in ${msg.guild.name} (${msg.guild.id}). Reason: `,
                err
            );
        }

        if (prefix === defaultPrefix) {
            return msg.util?.send(`Reset prefix back to \`${prefix}\``);
        }

        return msg.util?.send(`The prefix has been set to \`${prefix}\``);
    }
}

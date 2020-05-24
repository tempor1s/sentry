import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

export default class LogDeletesConfigCommand extends Command {
    public constructor() {
        super('config-logdeletes', {
            aliases: ['logdeletes'],
            description: {
                content:
                    'Enable/Disable the logging of deleted messages in the server.',
                usage: 'logdeletes',
            },
            channel: 'guild',
            category: 'config',
            clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
            userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
        });
    }

    public async exec(msg: Message) {
        let serverRepo = this.client.db.getRepository(Servers);
        let server = await serverRepo.findOne({
            where: { server: msg.guild.id },
        });

        let flag: boolean;
        if (server.messageLogDeletesEnabled) {
            flag = false;
        } else {
            flag = true;
        }

        // update the muterole
        try {
            await serverRepo.update(
                { server: msg.guild.id },
                { messageLogDeletesEnabled: flag }
            );

            logger.debug(
                `Set deleted message logging in ${msg.guild.name} (${msg.guild.id}) to: ${flag}`
            );
        } catch (err) {
            logger.error(
                `Error toggling deleted message logging in ${msg.guild.name} (${msg.guild.id}). Error: `,
                err
            );

            return msg.util?.send(
                'Error when toggling deleted message logging. Please try again.'
            );
        }

        return msg.util?.send(
            `Successfully ${
                flag ? 'enabled' : 'disabled'
            } deleted message logging.`
        );
    }
}

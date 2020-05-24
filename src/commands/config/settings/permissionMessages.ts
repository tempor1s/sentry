import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

export default class PermissionMessagesConfigCommand extends Command {
    public constructor() {
        super('config-permissionmessages', {
            description: {
                content:
                    'Enable/Disable messages for when a user does not have permissions to run a command.',
                usage: 'permissionmesssages',
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
        if (server.missingPermissionMessages) {
            flag = false;
        } else {
            flag = true;
        }

        // update the muterole
        try {
            await serverRepo.update(
                { server: msg.guild.id },
                { missingPermissionMessages: flag }
            );

            logger.debug(
                `Set permission messsages in ${msg.guild.name} (${msg.guild.id}) to: ${flag}`
            );
        } catch (err) {
            logger.error(
                `Error toggling permission messages in ${msg.guild.name} (${msg.guild.id}). Error: `,
                err
            );

            return msg.util?.send(
                'Error when toggling missing permission messages. Please try again.'
            );
        }

        return msg.util?.send(
            `Successfully ${
                flag ? 'enabled' : 'disabled'
            } missing permission messsages.`
        );
    }
}

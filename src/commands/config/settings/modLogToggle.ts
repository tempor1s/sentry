import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

export default class ModLogToggleConfigCommand extends Command {
    public constructor() {
        super('field-modlogtoggle', {
            aliases: ['modlogtoggle'],
            description: {
                content: 'Enable/Disable mod action logging on the server.',
                usage: 'modlogtoggle',
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
        if (server.modLogEnabled) {
            flag = false;
        } else {
            flag = true;
        }

        // update the muterole
        try {
            await serverRepo.update(
                { server: msg.guild.id },
                { modLogEnabled: flag }
            );

            logger.debug(
                `Set mod action logging in ${msg.guild.name} (${msg.guild.id}) to: ${flag}`
            );
        } catch (err) {
            logger.error(
                `Error toggling mod action logging in ${msg.guild.name} (${msg.guild.id}). Error: `,
                err
            );

            return msg.util?.send(
                'Error when toggling mod action logging. Please try again.'
            );
        }

        return msg.util?.send(
            `Successfully ${flag ? 'enabled' : 'disabled'} mod action logging.`
        );
    }
}

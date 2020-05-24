import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

export default class LogImagesConfigCommand extends Command {
    public constructor() {
        super('config-logimages', {
            aliases: ['logimages'],
            description: {
                content:
                    'Enable/Disable the logging of uploaded images in the server.',
                usage: 'logimages',
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
        if (server.messageLogImagesEnabled) {
            flag = false;
        } else {
            flag = true;
        }

        // update the muterole
        try {
            await serverRepo.update(
                { server: msg.guild.id },
                { messageLogImagesEnabled: flag }
            );

            logger.debug(
                `Set image upload logging in ${msg.guild.name} (${msg.guild.id}) to: ${flag}`
            );
        } catch (err) {
            logger.error(
                `Error toggling image upload logging in ${msg.guild.name} (${msg.guild.id}). Error: `,
                err
            );

            return msg.util?.send(
                'Error when toggling image upload logging. Please try again.'
            );
        }

        return msg.util?.send(
            `Successfully ${
                flag ? 'enabled' : 'disabled'
            } image upload logging.`
        );
    }
}

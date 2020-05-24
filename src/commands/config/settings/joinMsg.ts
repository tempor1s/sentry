import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

export default class JoinMessageConfigCommand extends Command {
    public constructor() {
        super('config-joinmsg', {
            aliases: ['joinmsg'],
            description: {
                content:
                    'Enable/Disable logging for when a user joins the server.',
                usage: 'joinmsg',
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
        if (server.joinMsgEnabled) {
            flag = false;
        } else {
            flag = true;
        }

        // update the muterole
        try {
            await serverRepo.update(
                { server: msg.guild.id },
                { joinMsgEnabled: flag }
            );

            logger.debug(
                `Set member join logging in ${msg.guild.name} (${msg.guild.id}) to: ${flag}`
            );
        } catch (err) {
            logger.error(
                `Error toggling member join logging in ${msg.guild.name} (${msg.guild.id}). Error: `,
                err
            );

            return msg.util?.send(
                'Error when toggling member join logging. Please try again.'
            );
        }

        return msg.util?.send(
            `Successfully ${flag ? 'enabled' : 'disabled'} member join logging.`
        );
    }
}

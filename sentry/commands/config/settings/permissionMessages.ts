import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

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
    const server = await getServerById(msg.guild!.id);

    let flag = server?.missingPermissionMessages ? false : true;

    try {
      const updated = await updateServerById(msg.guild!.id, {
        missingPermissionMessages: flag,
      });

      if (updated) {
        logger.debug(
          `Set permission messsages in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.error(
          `Error toggling permission messages in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when toggling missing permission messages. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling permission messages in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling missing permission messages. Please try again.'
      );
    }

    return msg.util?.send(
      `${flag ? 'Enabled' : 'Disabled'} missing permission messages.`
    );
  }
}

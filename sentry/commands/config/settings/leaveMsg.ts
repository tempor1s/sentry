import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class LeaveMessageConfigCommand extends Command {
  public constructor() {
    super('config-leavemsg', {
      description: {
        content: 'Enable/Disable logging for when a user leaves the server.',
        usage: 'leavemsg',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
    });
  }

  public async exec(msg: Message) {
    const server = await getServerById(msg.guild!.id);

    let flag = server?.leaveMsgEnabled ? false : true;

    try {
      const updated = await updateServerById(msg.guild!.id, {
        leaveMsgEnabled: flag,
      });

      if (updated) {
        logger.debug(
          `Set member leave logging in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.error(
          `Error toggling member leave logging in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when toggling member leave logging. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling member leave logging in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling member leave logging. Please try again.'
      );
    }

    return msg.util?.send(
      `${flag ? 'Enabled' : 'Disabled'} logging for when a member leaves.`
    );
  }
}

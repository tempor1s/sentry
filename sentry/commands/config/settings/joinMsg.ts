import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class JoinMessageConfigCommand extends Command {
  public constructor() {
    super('config-joinmsg', {
      description: {
        content: 'Enable/Disable logging for when a user joins the server.',
        usage: 'joinmsg',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
    });
  }

  public async exec(msg: Message) {
    const server = await getServerById(msg.guild!.id);

    let flag = server?.joinMsgEnabled ? false : true;

    // update the muterole
    try {
      const updated = await updateServerById(msg.guild!.id, {
        joinMsgEnabled: flag,
      });

      if (updated) {
        logger.debug(
          `Set member join logging in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.error(
          `Error toggling member join logging in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when toggling member join logging. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling member join logging in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling member join logging. Please try again.'
      );
    }

    return msg.util?.send(
      `${flag ? 'Enabled' : 'Disabled'} member join logging.`
    );
  }
}

import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class LogDeletesConfigCommand extends Command {
  public constructor() {
    super('config-logdeletes', {
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
    const server = await getServerById(msg.guild!.id);

    let flag = server?.messageLogDeletesEnabled ? false : true;

    // update the muterole
    try {
      const updated = await updateServerById(msg.guild!.id, {
        messageLogDeletesEnabled: flag,
      });

      if (updated) {
        logger.debug(
          `Set deleted message logging in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.error(
          `Error toggling deleted message logging in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when toggling deleted message logging. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling deleted message logging in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling deleted message logging. Please try again.'
      );
    }

    return msg.util?.send(
      `${flag ? 'Enabled' : 'Disabled'} deleted message logging.`
    );
  }
}

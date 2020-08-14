import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class LogEditsConfigCommand extends Command {
  public constructor() {
    super('config-logedits', {
      description: {
        content: 'Enable/Disable the logging of edited messages in the server.',
        usage: 'logedits',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
    });
  }

  public async exec(msg: Message) {
    const server = await getServerById(msg.guild!.id);

    let flag = server?.messageLogEditsEnabled ? false : true;

    // update the muterole
    try {
      const updated = await updateServerById(msg.guild!.id, {
        messageLogEditsEnabled: flag,
      });

      if (updated) {
        logger.debug(
          `Set message edit logging in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.debug(
          `Error setting message edit logging in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );

        return msg.util?.send(
          'Error when toggling edit message logging. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling message edit logging in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling edit message logging. Please try again.'
      );
    }

    return msg.util?.send(
      `${flag ? 'Enabled' : 'Disabled'} logging of message edits.`
    );
  }
}

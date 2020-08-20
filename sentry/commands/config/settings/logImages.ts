import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class LogImagesConfigCommand extends Command {
  public constructor() {
    super('config-logimages', {
      description: {
        content: 'Enable/Disable the logging of uploaded images in the server.',
        usage: 'logimages',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
    });
  }

  public async exec(msg: Message) {
    const server = await getServerById(msg.guild!.id);

    let flag = server?.messageLogImagesEnabled ? false : true;

    // update the muterole
    try {
      const updated = await updateServerById(msg.guild!.id, {
        messageLogImagesEnabled: flag,
      });

      if (updated) {
        logger.debug(
          `Set image upload logging in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.error(
          `Error toggling image upload logging in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when toggling image upload logging. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling image upload logging in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling image upload logging. Please try again.'
      );
    }

    return msg.util?.send(
      `${flag ? 'Enabled' : 'Disabled'} image upload logging.`
    );
  }
}

import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class WelcomeMsgEmbededConfigCommand extends Command {
  public constructor() {
    super('config-welcomemsgembed', {
      description: {
        content: 'Enable/Disable if welcome message is embeded in the server.',
        usage: 'welcomemsgembed',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
    });
  }

  public async exec(msg: Message) {
    const server = await getServerById(msg.guild!.id);

    let flag = server?.welcomeMessageEmbeded ? false : true;

    // update if welcome message is enabled
    try {
      const updated = updateServerById(msg.guild!.id, {
        welcomeMessageEmbeded: flag,
      });

      if (updated) {
        logger.debug(
          `Set embeded welcome message in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.error(
          `Error toggling embeded welcome message in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when toggling embeded welcome message. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling embeded welcome message in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling embeded welcome message. Please try again.'
      );
    }

    return msg.util?.send(
      `${flag ? 'Enabled' : 'Disabled'} embeded welcome message.`
    );
  }
}

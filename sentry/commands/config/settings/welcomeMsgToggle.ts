import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class WelcomeMsgToggleConfigCommand extends Command {
  public constructor() {
    super('config-welcomemsgtoggle', {
      description: {
        content: 'Enable/Disable the welcome message in the server.',
        usage: 'welcomemsgtoggle',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
    });
  }

  public async exec(msg: Message) {
    const server = await getServerById(msg.guild!.id);

    let flag = server!.welcomeMessageEnabled ? false : true;

    // update if welcome message is enabled
    try {
      const updated = await updateServerById(msg.guild!.id, {
        welcomeMessageEnabled: flag,
      });

      if (updated) {
        logger.debug(
          `Set welcome message in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.error(
          `Error toggling welcome message in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when toggling welcome message. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling welcome message in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling welcome message. Please try again.'
      );
    }

    return msg.util?.send(`${flag ? 'Enabled' : 'Disabled'} welcome message.`);
  }
}

import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { updateServerById } from '../../../services/server';

export default class WelcomeMsgConfigCommand extends Command {
  public constructor() {
    super('config-welcomemsg', {
      description: {
        content: 'Change the welcome message in the server.',
        usage: 'welcomemsg <message>',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      args: [
        {
          id: 'message',
          type: 'text',
          match: 'rest',
        },
      ],
    });
  }

  public async exec(msg: Message, { message }: { message: string }) {
    if (!message) {
      return msg.util?.send(
        'Please specify a message to change the welcome message to.'
      );
    }

    // update the welcome message
    try {
      const updated = await updateServerById(msg.guild!.id, {
        welcomeMessage: message,
      });

      if (updated) {
        logger.debug(
          `Set welcome message in ${msg.guild?.name} (${msg.guild?.id}) to: *${message}*`
        );
      } else {
        logger.error(
          `Error changing welcome message in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when changing welcome message. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error changing welcome message in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when changing welcome message. Please try again.'
      );
    }

    return msg.util?.send(`Changed Welcome Message: \`${message}\``);
  }
}

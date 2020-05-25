import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

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

    let serverRepo = this.client.db.getRepository(Servers);

    // update the welcome message
    try {
      await serverRepo.update(
        { server: msg.guild.id },
        { welcomeMessage: message }
      );

      logger.debug(
        `Set welcome message in ${msg.guild.name} (${msg.guild.id}) to: *${message}*`
      );
    } catch (err) {
      logger.error(
        `Error changing welcome message in ${msg.guild.name} (${msg.guild.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when changing welcome message. Please try again.'
      );
    }

    return msg.util?.send(`Successfully changed welcome message.`);
  }
}

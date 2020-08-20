import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class WelcomeMsgChanConfigCommand extends Command {
  public constructor() {
    super('config-welcomemsgchan', {
      description: {
        content: 'Update the modlog channel in the server.',
        usage: 'welcomemsgchan <channel>',
        examples: ['', '#welcome', 'welcome', '712205605951242273'],
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      args: [
        {
          id: 'channel',
          type: 'textChannel',
        },
      ],
    });
  }

  public async exec(msg: Message, { channel }: { channel: TextChannel }) {
    const server = await getServerById(msg.guild!.id);

    if (!channel) {
      if (server?.welcomeChannel) {
        let oldChannel = msg.guild!.channels.cache.get(server.welcomeChannel);
        return msg.util?.send(`Current Welcome Channel: ${oldChannel}`);
      }

      return msg.util?.send(
        'The channel to send the welcome message to is not configured.'
      );
    }

    // update the command log channel
    try {
      const updated = updateServerById(msg.guild!.id, {
        welcomeChannel: channel.id,
      });

      if (updated) {
        logger.debug(
          `Updating welcome message channel in ${msg.guild?.name} (${msg.guild?.id}) to ${channel.name} (${channel.id})`
        );
      } else {
        logger.error(
          `Error updating welcome message channel in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when updating the welcome message channel.'
        );
      }
    } catch (err) {
      logger.error(
        `Error updating welcome message channel in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send('Error when updating the welcome message channel.');
    }

    return msg.util?.send(`Updated Welcome Channel: ${channel}`);
  }
}

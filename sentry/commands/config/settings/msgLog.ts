import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class MessageLogConfigCommand extends Command {
  public constructor() {
    super('config-msglog', {
      description: {
        content: 'Update the msglog channel in the server.',
        usage: 'msglog [channel]',
        examples: ['', '#msglog', 'msglog', '712205605951242273'],
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
      if (server?.messageLog) {
        let oldChannel = msg.guild!.channels.cache.get(server.messageLog);
        return msg.util?.send(`Current Message Log Channel: ${oldChannel}`);
      }

      return msg.util?.send('There is no message log channel currently set.');
    }

    // update the command log channel
    try {
      const updated = updateServerById(msg.guild!.id, {
        messageLog: channel.id,
      });

      if (updated) {
        logger.debug(
          `Updating message log channel in ${msg.guild?.name} (${msg.guild?.id}) to ${channel.name} (${channel.id})`
        );
      } else {
        logger.error(
          `Error updating message log channel in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send('Error when updating the message log channel.');
      }
    } catch (err) {
      logger.error(
        `Error updating message log channel in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send('Error when updating the message log channel.');
    }

    return msg.util?.send(`Updated Message Log Channel: ${channel}`);
  }
}

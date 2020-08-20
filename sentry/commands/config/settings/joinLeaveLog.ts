import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class JoinLeaveLogConfigCommand extends Command {
  public constructor() {
    super('config-joinleavelog', {
      description: {
        content: 'Update the channel for join/leave logging in the server.',
        usage: 'joinleavelog [channel]',
        examples: ['', '#joinleave', 'joinleave', '712205605951242273'],
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
      if (server?.joinLeaveLog) {
        let oldChannel = msg.guild!.channels.cache.get(server.joinLeaveLog);
        return msg.util?.send(`Join/Leave Log Channel: ${oldChannel}`);
      }

      return msg.util?.send('No Join/Leave log channel set.');
    }

    // update the command log channel
    try {
      const updated = await updateServerById(msg.guild!.id, {
        joinLeaveLog: channel.id,
      });

      if (updated) {
        logger.debug(
          `Updating join/leave log channel in ${msg.guild?.name} (${msg.guild?.id}) to ${channel.name} (${channel.id})`
        );
      } else {
        logger.debug(
          `Error updating join/leave log channel in ${msg.guild?.name} (${msg.guild?.id}) to ${channel.name} (${channel.id})`
        );

        return msg.util?.send(
          'Error when updating the join/leave log channel.'
        );
      }
    } catch (err) {
      logger.error(
        `Error updating join/leave log channel in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send('Error when updating the join/leave log channel.');
    }

    return msg.util?.send(`Updated Join/Leave Channel: ${channel}`);
  }
}

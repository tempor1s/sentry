import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

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
    let serverRepo = this.client.db.getRepository(Servers);
    let server = await serverRepo.findOne({
      where: { server: msg.guild!.id },
    });

    if (!channel) {
      if (server?.joinLeaveLog) {
        let oldChannel = msg.guild!.channels.cache.get(server.joinLeaveLog);
        return msg.util?.send(`Join/Leave Log Channel: ${oldChannel}`);
      }

      return msg.util?.send('No Join/Leave log channel set.');
    }

    // update the command log channel
    try {
      await serverRepo.update(
        { server: msg.guild!.id },
        { joinLeaveLog: channel.id }
      );

      logger.debug(
        `Updating join/leave log channel in ${msg.guild?.name} (${msg.guild?.id}) to ${channel.name} (${channel.id})`
      );
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

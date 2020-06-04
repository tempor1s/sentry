import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

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
    let serverRepo = this.client.db.getRepository(Servers);
    let server = await serverRepo.findOne({
      where: { server: msg.guild!.id },
    });

    if (!channel) {
      if (server?.messageLog) {
        let oldChannel = msg.guild!.channels.cache.get(server.messageLog);
        return msg.util?.send(`Current Message Log Channel: ${oldChannel}`);
      }

      return msg.util?.send('There is no message log channel currently set.');
    }

    // update the command log channel
    try {
      await serverRepo.update(
        { server: msg.guild!.id },
        { messageLog: channel.id }
      );

      logger.debug(
        `Updating message log channel in ${msg.guild?.name} (${msg.guild?.id}) to ${channel.name} (${channel.id})`
      );
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

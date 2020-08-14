import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { getServerById, updateServerById } from '../../../services/server';
import logger from '../../../utils/logger';

export default class CommandLogConfigCommand extends Command {
  public constructor() {
    super('config-commandlog', {
      description: {
        content: 'Update the command log channel in the server.',
        usage: 'commandlog [channel]',
        examples: ['', '#commandlog', 'commandlog', '712205605951242273'],
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
      if (!server?.commandLog) {
        return msg.util?.send('Current Command Log Channel: *Not Set*');
      }

      let oldChannel = msg.guild!.channels.cache.get(server.commandLog);

      return msg.util?.send(`Current Command Log Channel: ${oldChannel}`);
    }

    // update the command log channel
    try {
      const updated = updateServerById(msg.guild!.id, {
        commandLog: channel.id,
      });

      if (updated) {
        logger.debug(
          `Updating command log channel in ${msg.guild?.name} (${msg.guild?.id}) to ${channel.name} (${channel.id})`
        );
      } else {
        logger.debug(
          `Failed updating command log channel in ${msg.guild?.name} (${msg.guild?.id}) to ${channel.name} (${channel.id})`
        );

        return msg.util?.send('Error when updating the command log channel.');
      }
    } catch (err) {
      logger.error(
        `Error updating command log channel in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send('Error when updating the command log channel.');
    }

    return msg.util?.send(`Updated Command Log Channel: ${channel}`);
  }
}

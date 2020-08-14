import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class ModLogConfigCommand extends Command {
  public constructor() {
    super('config-modlog', {
      description: {
        content: 'Update the modlog channel in the server.',
        usage: 'modlog [channel]',
        examples: ['', '#modlog', 'modlog', '712205605951242273'],
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
      if (server?.modLog) {
        let oldChannel = msg.guild!.channels.cache.get(server.modLog);
        return msg.util?.send(`Current Mod Log Channel: ${oldChannel}`);
      }

      return msg.util?.send('There is no modlog channel currently set.');
    }

    // update the command log channel
    try {
      const updated = updateServerById(msg.guild!.id, { modLog: channel.id });

      if (updated) {
        logger.debug(
          `Updating modlog channel in ${msg.guild?.name} (${msg.guild?.id}) to ${channel.name} (${channel.id})`
        );
      } else {
        logger.error(
          `Error updating modlog channel in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send('Error when updating the modlog channel.');
      }
    } catch (err) {
      logger.error(
        `Error updating modlog channel in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send('Error when updating the modlog channel.');
    }

    return msg.util?.send(
      `The command log channel has been set to ${channel} (${channel.id})`
    );
  }
}

import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { Servers } from '../../../models/server';
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
    let serverRepo = this.client.db.getRepository(Servers);
    let server = await serverRepo.findOne({
      where: { server: msg.guild.id },
    });

    if (!channel) {
      if (server.commandLog) {
        let oldChannel = msg.guild.channels.cache.get(server.modLog);
        return msg.util?.send(
          `The current command log channel is ${oldChannel.name} (${oldChannel.id})`
        );
      }

      return msg.util?.send('There is no command log channel currently set.');
    }

    // update the command log channel
    try {
      await serverRepo.update(
        { server: msg.guild.id },
        { commandLog: channel.id }
      );

      logger.debug(
        `Updating command log channel in ${msg.guild.name} (${msg.guild.id}) to ${channel.name} (${channel.id})`
      );
    } catch (err) {
      logger.error(
        `Error updating command log channel in ${msg.guild.name} (${msg.guild.id}). Error: `,
        err
      );

      return msg.util?.send('Error when updating the command log channel.');
    }

    return msg.util?.send(
      `The command log channel has been set to ${channel} (${channel.id})`
    );
  }
}

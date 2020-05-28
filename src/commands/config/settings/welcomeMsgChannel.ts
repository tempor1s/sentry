import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

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
    let serverRepo = this.client.db.getRepository(Servers);
    let server = await serverRepo.findOne({
      where: { server: msg.guild!.id },
    });

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
      await serverRepo.update(
        { server: msg.guild!.id },
        { welcomeChannel: channel.id }
      );

      logger.debug(
        `Updating welcome message channel in ${msg.guild?.name} (${msg.guild?.id}) to ${channel.name} (${channel.id})`
      );
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

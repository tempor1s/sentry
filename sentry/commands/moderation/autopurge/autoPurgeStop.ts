import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import {
  getSingleAutoPurge,
  stopSingleAutoPurge,
} from '../../../services/autopurge';

export default class AutoPurgeStopCommand extends Command {
  public constructor() {
    super('autopurge-stop', {
      category: 'moderation',
      clientPermissions: [
        Permissions.FLAGS.MANAGE_MESSAGES,
        Permissions.FLAGS.MANAGE_CHANNELS,
      ],
      userPermissions: [
        Permissions.FLAGS.MANAGE_MESSAGES,
        Permissions.FLAGS.MANAGE_CHANNELS,
      ],
      args: [
        {
          id: 'channel',
          type: 'textChannel',
          default: (msg: Message) => msg.channel,
        },
      ],
    });
  }

  public async exec(msg: Message, { channel }: { channel: TextChannel }) {
    const existingPurge = await getSingleAutoPurge(msg.guild!.id, channel.id);

    // purge already exists on the channel
    if (!existingPurge) {
      return msg.util?.send('There is no auto purge enabled for this channel.');
    }

    // remove the auto purge from the channel
    const stopped = await stopSingleAutoPurge(channel.id);

    if (!stopped)
      return msg.util?.send(`Failed to remove auto purge. Please try again.`);

    return msg.util?.send(`Removed auto purge from ${channel}.`);
  }
}

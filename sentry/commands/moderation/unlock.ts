import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { unlockChannel } from '../../services/channellocks';
import { logChannelUnlock } from '../../services/serverlogs';

export default class UnlockCommand extends Command {
  public constructor() {
    super('unlock', {
      aliases: ['unlock'],
      description: {
        content:
          'Resume the ability to send messages in a channel after a lock.',
        usage: 'unlock [channel] [duration]',
        examples: ['', '#general', '#general 2h', 'general 10m'],
      },
      category: 'moderation',
      channel: 'guild',
      userPermissions: [
        Permissions.FLAGS.MANAGE_MESSAGES,
        Permissions.FLAGS.MANAGE_CHANNELS,
      ],
      clientPermissions: [
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
    // try to unlock the channel
    let unlocked = await unlockChannel(channel);

    if (!unlocked)
      return msg.util?.send('Channel is not locked or unlock failed.');

    logChannelUnlock(channel, msg.member!);

    if (msg.channel.id !== channel.id)
      return msg.util?.send('Channel unlocked! :)');
  }
}

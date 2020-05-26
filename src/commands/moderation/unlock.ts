import ms from 'ms';
import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { unlockChannel } from '../../structures/lockManager';
import { ChannelLocks } from '../../models/channelLocks';
import { logChannelUnlock } from '../../structures/logManager';
import { Servers } from '../../models/server';

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
    // get the ChannelLocks repo
    const channelLocksRepo = this.client.db.getRepository(ChannelLocks);
    const serversRepo = this.client.db.getRepository(Servers);
    // try to lock the channel
    let unlocked = await unlockChannel(channelLocksRepo, channel);

    if (!unlocked)
      return msg.util?.send('Channel is not locked or unlock failed.');

    logChannelUnlock(serversRepo, channel, msg.member);

    if (msg.channel.id !== channel.id)
      return msg.util?.send('Channel unlocked! :)');
  }
}

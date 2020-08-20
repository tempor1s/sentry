import ms from 'ms';
import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { lockChannel } from '../../services/channellocks';
import { logChannelLock } from '../../services/serverlogs';
import { getDefaultEmbed } from '../../utils/message';

export default class LockCommand extends Command {
  public constructor() {
    super('lock', {
      aliases: ['lock', 'lockdown'],
      description: {
        content: 'Stop the sending of all messages in the channel.',
        usage: 'lock [channel] [duration]',
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
        {
          id: 'duration',
          type: (_: Message, str: string) => {
            if (str) {
              return Number(ms(str));
            }
            return 0;
          },
        },
      ],
    });
  }

  public async exec(
    msg: Message,
    { channel, duration }: { channel: TextChannel; duration: number }
  ) {
    // try to lock the channel
    let locked = await lockChannel(channel, duration);

    if (!locked)
      return msg.util?.send('Channel is already locked or lock failed.');

    logChannelLock(duration, channel, msg.member!);

    if (msg.channel.id !== channel.id)
      msg.util?.send(
        getDefaultEmbed()
          .setTitle('Channel Locked')
          .addField('Channel', channel, true)
          .addField('Moderator', msg.member, true)
          .addField('Duration', duration ? ms(duration) : 'Indefinite', true)
      );
  }
}

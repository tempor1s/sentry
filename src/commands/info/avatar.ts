import { Command } from 'discord-akairo';
import { Message, GuildMember, ImageSize } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';

export default class AvatarCommand extends Command {
  public constructor() {
    super('avatar', {
      aliases: ['avatar', 'av'],
      category: 'info',
      description: {
        content: 'Display the avatar of a user.',
        usage: 'avatar <user>',
        examples: ['', '@temporis#6402', 'temporis', '111901076520767488'],
      },
      args: [
        {
          id: 'member',
          type: 'member',
          match: 'rest',
          default: (msg: Message) => msg.member,
        },
        {
          id: 'size',
          type: (_: Message, str: string): null | number => {
            if (
              str &&
              !isNaN(Number(str)) &&
              [16, 32, 64, 128, 256, 512, 1024, 2048].includes(Number(str))
            )
              return Number(str);
            return null;
          },
          match: 'option',
          flag: ['-size='], // avatar @temporis#6402 -size=512
          default: 2048,
        },
      ],
    });
  }

  public async exec(
    msg: Message,
    { member, size }: { member: GuildMember; size: number }
  ) {
    return msg.util?.send(
      getDefaultEmbed()
        .setTitle(`Avatar | ${member.user.tag}`)
        .setImage(member.user.displayAvatarURL({ size: size as ImageSize }))
    );
  }
}

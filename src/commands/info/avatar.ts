import { Command } from 'discord-akairo'
import { Message, GuildMember, MessageEmbed, ImageSize } from 'discord.js'

export default class Avatar extends Command {
    public constructor() {
        super('avatar', {
            aliases: ['avatar'],
            category: 'info',
            description: {
                content: 'Display the avatar of a user.',
                usage: 'avatar @user',
                examples: [
                    'avatar',
                    'avatar @temporis#6402',
                    'avatar host',
                    'avatar 111901076520767488',
                ],
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
                            [16, 32, 64, 128, 256, 512, 1024, 2048].includes(
                                Number(str)
                            )
                        )
                            return Number(str)
                        return null
                    },
                    match: 'option',
                    flag: ['-size='], // avatar @temporis#6402 -size=512
                    default: 2048,
                },
            ],
        })
    }

    public exec(
        msg: Message,
        { member, size }: { member: GuildMember; size: number }
    ): Promise<Message> {
        return msg.util.send(
            new MessageEmbed()
                .setTitle(`Avatar | ${member.user.tag}`)
                .setColor('DARK_GREY')
                .setImage(
                    member.user.displayAvatarURL({ size: size as ImageSize })
                )
        )
    }
}

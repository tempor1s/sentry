import { Command } from 'discord-akairo';
import { GuildMember, Message, Permissions } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { getDefaultEmbed } from '../../utils/message';

export default class UserInfo extends Command {
    public constructor() {
        super('userinfo', {
            aliases: ['userinfo', 'user', 'whois', 'member', 'user-info'],
            description: {
                content: 'Get information about a user in a server.',
                usage: 'userinfo [member]',
                examples: ['temporis', '@temporis#6402', '111901076520767488'],
            },
            category: 'info',
            channel: 'guild',
            clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
            args: [
                {
                    id: 'member',
                    match: 'content',
                    type: 'member',
                    default: (msg: Message) => msg.member,
                },
            ],
        });
    }

    public async exec(msg: Message, { member }: { member: GuildMember }) {
        const { user } = member;
        let isBanned = '';

        try {
            await msg.guild.fetchBan(user);
            isBanned = 'Yes';
        } catch (err) {
            isBanned = 'No';
        }

        const embed = getDefaultEmbed()
            .setTitle(user.tag)
            .addField('ID', user.id, false)
            .addField(
                'Account Created',
                moment.utc(user.createdAt).format('MM/DD/YYYY hh:mm:ss'),
                true
            )
            .addField(
                'Nickname',
                member.nickname == undefined ? 'No nickname' : member.nickname,
                true
            )
            .addField('Is Bot?', user.bot, true)
            .addField('Banned?', isBanned, true)
            .addField('Status', user.presence.status.toUpperCase(), true)
            .addField(
                'Activity',
                user.presence.activities?.[0]?.name ?? 'None',
                true
            )
            .addField(
                'Roles',
                member.roles.cache.map((role) => role).join(', '),
                false
            )
            .setThumbnail(user.displayAvatarURL());

        msg.util?.send(embed);
    }
}

import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';
import { Servers } from '../../models/server';
import { Mutes } from '../../models/mutes';
import { duration as dur } from 'moment';
import 'moment-duration-format';
import ms from 'ms';
import { createMuteOrUpdate, mute } from '../../structures/mutemanager';

export default class MuteCommand extends Command {
    public constructor() {
        super('mute', {
            aliases: ['mute', 'silence'],
            description: {
                content: 'Mute a user in the discord server.',
                usage: 'mute <user> [duration] [reason]',
                examples: [
                    'mute @temporis#6402',
                    'mute @temporis#6402 10m',
                    'mute @temporis#6402 10m spamming',
                    'mute temporis',
                    'mute 111901076520767488 10h',
                    'mute @temporis#6402 30s',
                ],
            },
            category: 'moderation',
            channel: 'guild',
            userPermissions: [
                Permissions.FLAGS.MUTE_MEMBERS,
                Permissions.FLAGS.MANAGE_ROLES,
                Permissions.FLAGS.MANAGE_MESSAGES,
            ],
            clientPermissions: [
                Permissions.FLAGS.MUTE_MEMBERS,
                Permissions.FLAGS.MANAGE_ROLES,
                Permissions.FLAGS.MANAGE_MESSAGES,
            ],
            args: [
                {
                    id: 'member',
                    type: 'member',
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
                {
                    id: 'reason',
                    type: 'string',
                    match: 'rest',
                    default: (_: Message) => 'No reason provided.',
                },
            ],
        });
    }

    public async exec(
        msg: Message,
        {
            member,
            duration,
            reason,
        }: { member: GuildMember; duration: number; reason: string }
    ) {
        // If they did not specify a member.
        if (!member) {
            return msg.util?.send('Please specify a user to mute.');
        }

        // Check to make sure that we are not muting someone with an equal or higher role
        if (
            member.roles.highest.position >=
                msg.member.roles.highest.position &&
            msg.author.id !== msg.guild.ownerID
        ) {
            return msg.util.send(
                'This member has a higher or equal role to you. You are unable to mute them.'
            );
        }

        // TODO: Could just swap this over to checking user roles later if we need to optimize DB
        let mutesRepo = this.client.db.getRepository(Mutes);
        let mutedUser = await mutesRepo.findOne({
            where: { server: msg.guild.id, user: member.id },
        });

        if (mutedUser) {
            return msg.util?.send('That user is already muted.');
        }

        // Get the guild that we are going to be getting info for
        let serverRepo = this.client.db.getRepository(Servers);
        let guild = await serverRepo.findOne({
            where: { server: msg.guild.id },
        });

        // If no user defined duration, then use servers default mute duration.
        if (!duration) {
            duration = guild.muteDuration;
        }

        // Get the ID of the 'muted' role.
        let muteRoleId = guild.mutedRole;
        if (!muteRoleId) {
            muteRoleId = await createMuteOrUpdate(serverRepo, msg.guild);
        }

        // Mute the person
        await mute(mutesRepo, msg, member, muteRoleId, reason, duration);

        // Info sent to the channel for when the person is muted
        const embed = getDefaultEmbed('GREEN')
            .setTitle(`Muted ${member.user.tag}`)
            .addField('Reason', reason, true)
            .addField('Moderator', msg.member.user, true)
            .addField(
                'Mute Duration',
                dur(duration).format('d[d ]h[h ]m[m ]s[s]'),
                true
            );

        return msg.util?.send(embed);
    }
}

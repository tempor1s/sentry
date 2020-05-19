import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';
import { Servers } from '../../models/server';
import { Mutes } from '../../models/mutes';
import { duration as dur } from 'moment';
import 'moment-duration-format';
import ms from 'ms';
import { createMuteOrUpdate, mute, unmute } from '../../structures/mutemanager';

export default class MuteCommand extends Command {
    public constructor() {
        super('mute', {
            aliases: ['mute', 'silence'],
            description: {
                content: 'Mute a user in the discord server.',
                usage: ['mute <user> [duration]'],
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

        // Get the guild that we are going to be getting info for
        let serverRepo = this.client.db.getRepository(Servers);
        let guild = await serverRepo.findOne({
            where: { server: msg.guild.id },
        });

        // If no user defined duration, then use servers default mute duration.
        if (!duration) {
            duration = guild.muteDuration;
        }

        // Get the time that the mute will end
        const end = Date.now() + duration;

        // TODO: Remove all of their current roles before we assign them the muted role.
        let muteRoleId = guild.mutedRole;

        if (!muteRoleId) {
            muteRoleId = await createMuteOrUpdate(serverRepo, msg.guild);
        }

        // Add the muted role
        await member.roles
            .add(muteRoleId, `Muted | Reason: ${reason}`)
            .catch(() => {
                return msg.util?.send(
                    'Coud not mute user. This is probably due to an issue with permissions.'
                );
            });

        // Let the user know we muted them
        // TODO: Add flag to make it silent and not mute them.
        member.send(
            `You have been muted by ${msg.member.user} in ${
                msg.guild.name
            } for \`${dur(duration).format('d[d ]h[h ]m[m ]s[s]')}\``
        );

        let muteRepo = this.client.db.getRepository(Mutes);

        // TODO: Check to see if they are already muted.
        let roles = member.roles.cache.map((role) => role.id);

        // Insert the mute into the DB
        muteRepo.insert({
            server: msg.guild.id,
            user: member.user.id,
            end: end,
            reason: reason,
            moderator: msg.member.id,
            roles: roles,
        });

        // Unmute the user at the end of the duration.
        setTimeout(async () => {
            await member.roles.remove(muteRoleId, 'Unmuted');
            // TODO: Add back all the roles we removed from them.
            // TODO: Remove mute from the DB
        }, duration);

        const embed = getDefaultEmbed('GREEN')
            .setTitle(`Muted ${member.user.tag}`)
            .addField('Reason', reason)
            .addField('Moderator', msg.member.user)
            .addField('Ends', dur(duration).format('d[d ]h[h ]m[m ]s[s]'));

        return msg.util?.send(embed);
    }
}

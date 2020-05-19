import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';
import { Servers } from '../../models/server';
import { Mutes } from '../../models/mutes';
import { duration as dur, utc } from 'moment';
import 'moment-duration-format';
import ms from 'ms';

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
                // TODO: Add reason
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

        // TODO: Check to make sure the person we are muting do not have higher or same role as us.

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
            // TODO: If we do not have a muted role, either find one or create it and add it to the DB.
            // TODO: Also check
            // let myRole = message.guild.roles.find(role => role.name === "Moderators");
        }

        // Let the user know we muted them
        // TODO: Add flag to make it silent and not mute them.
        member.send(
            `You have been muted by ${msg.member.user} in ${
                msg.guild.name
            } for \`${dur(duration).format('d[d ]h[h ]m[m ]s[s]')}\``
        );

        // add the muted role
        await member.roles
            .add(muteRoleId, `Muted | Reason: ${reason}`)
            .catch(() => {
                return msg.util?.send(
                    'Coud not mute user. This is probably due to an issue with permissions.'
                );
            });

        let muteRepo = this.client.db.getRepository(Mutes);

        // TODO: Check to see if they are already muted.

        // Insert the mute into the DB
        muteRepo.insert({
            server: msg.guild.id,
            user: member.user.id,
            end: end,
            reason: reason,
            moderator: msg.member.id,
            roles: member.roles.cache.map((role) => role.id),
        });

        // Unmute the user at the end of the duration.
        setTimeout(async () => {
            await member.roles.remove(muteRoleId, 'Unmuted');
            // TODO: Add back all the roles we removed from them.
            // TODO: Remove mute form the DB
        }, duration);

        const embed = getDefaultEmbed('GREEN')
            .setTitle(`Muted ${member.user.tag}`)
            .addField('Reason', reason)
            .addField('Moderator', msg.member.user)
            .addField('Ends', dur(duration).format('d[d ]h[h ]m[m ]s[s]'));

        return msg.util?.send(embed);
    }
}

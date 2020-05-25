import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import logger from '../../utils/logger';
import { logBan } from '../../structures/logManager';
import { Servers } from '../../models/server';
import { getDefaultEmbed } from '../../utils/message';
import { checkHigherOrEqualPermissions } from '../../utils/permissions';

export default class BanCommand extends Command {
    public constructor() {
        super('ban', {
            aliases: ['ban'],
            description: {
                content: 'Ban a user from the server.',
                usage: 'ban <user> [reason]',
                examples: [
                    '@temporis#6402',
                    'temporis ur bad',
                    '111901076520767488 bad words',
                    'temporis urbad --silent',
                    '@temporis#6402 racism --days=30d',
                ],
            },
            category: 'moderation',
            channel: 'guild',
            clientPermissions: [Permissions.FLAGS.BAN_MEMBERS],
            userPermissions: [Permissions.FLAGS.BAN_MEMBERS],
            args: [
                {
                    id: 'member',
                    type: 'member',
                },
                {
                    id: 'reason',
                    type: 'string',
                    match: 'rest',
                    default: (_: Message) => 'No reason provided.',
                },
                {
                    id: 'days',
                    type: 'integer',
                    match: 'option',
                    flag: ['--days=', '-d='],
                    default: 7,
                },
                {
                    id: 'silent',
                    match: 'flag',
                    flag: ['--silent', '-s'],
                    default: false,
                },
            ],
        });
    }

    public async exec(
        msg: Message,
        {
            member,
            reason,
            days,
            silent,
        }: {
            member: GuildMember;
            reason: string;
            days: number;
            silent: boolean;
        }
    ) {
        if (!member) {
            return msg.util?.send(
                'Please specify a user to ban / user not found.'
            );
        }

        // check to make sure they are not a higher role
        if (await checkHigherOrEqualPermissions(msg, member))
            return msg.util.send(
                `That member has a higher or equal role to you. You are unable to ban them.`
            );

        let serversRepo = this.client.db.getRepository(Servers);

        try {
            // check to make sure they are not already banned
            if (await member.guild.fetchBan(member).catch(() => {})) {
                return msg.util?.send('That user is already banned.');
            }

            // ban the user and send them a msg
            await member.ban({ reason: reason, days: days }).then(() => {
                if (!silent) {
                    member.send(
                        `You have been banned from ${member.guild.name} for the reason: *${reason}*`
                    );
                }
            });

            // log ban
            logBan(serversRepo, member, reason, msg.member);

            logger.debug(
                `Banned ${member.user.tag} (${member.id}) for reason: ${reason}`
            );
        } catch (err) {
            logger.error('Error banning user. Error: ', err);
            return msg.util?.send('Error occured when trying to ban the user.');
        }

        const embed = getDefaultEmbed('GREEN')
            .setTitle('Banned')
            .addField('Reason', reason)
            .addField('User', member.user, true)
            .addField('Duration', 'Indefinite', true)
            .addField('Moderator', msg.member.user, true);

        return msg.util?.send(embed);
    }
}

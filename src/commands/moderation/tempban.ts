import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import logger from '../../utils/logger';
import { logBan } from '../../structures/logManager';
import { Servers } from '../../models/server';
import { getDefaultEmbed } from '../../utils/message';
import ms from 'ms';
import { TempBans } from '../../models/tempbans';

export default class TempBanCommand extends Command {
    public constructor() {
        // TODO: Allow the ability to purge messages after a ban
        super('tempban', {
            aliases: ['tempban'],
            description: {
                content: 'Temporarily ban a user from the server.',
                usage: 'tempban <user> <duration> [reason]',
                examples: [
                    'tempban @temporis#6402 1d',
                    'tempban temporis 10d spamming',
                    'tempban 111901076520767488 30d bad words',
                ],
            },
            category: 'moderation',
            channel: 'guild',
            clientPermissions: [Permissions.FLAGS.BAN_MEMBERS],
            userPermissions: [Permissions.FLAGS.BAN_MEMBERS],
            // TODO: Create a silent flag to not send them a message. (maybe dont log??)
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
        if (!member) {
            return msg.util?.send('Please specify a user to temporarily ban.');
        }

        if (!duration) {
            return msg.util?.send(
                'Please specify a duration to ban the user for. Max: `30d`'
            );
        }

        if (duration > 2.592e9) {
            return msg.util.send(
                'Please specify a duration less than 30 days.'
            );
        }

        // Checks so that you can not temp ban someone higher than you.
        if (
            member.roles.highest.position >=
                msg.member.roles.highest.position &&
            msg.author.id !== msg.guild.ownerID
        ) {
            return msg.util.send(
                'That member has a higher or equal role to you. You are unable to ban them.'
            );
        }

        let serversRepo = this.client.db.getRepository(Servers);
        let tempBansRepo = this.client.db.getRepository(TempBans);

        let msDuration = ms(duration);

        try {
            // ban the user and send them a msg
            await member.ban({ reason: reason }).then(() => {
                member.send(
                    `You have been temporarily banned from ${member.guild.name} for \`${msDuration}\` for the reason: *${reason}*`
                );
            });

            // so that we can unban people later :)
            await tempBansRepo.insert({
                server: msg.guild.id,
                user: member.id,
                end: Date.now() + duration,
                reason: reason,
                moderator: msg.member.id,
            });

            // log ban
            logBan(serversRepo, member, reason, msg.member, msDuration);

            logger.debug(
                `Temp banned ${member.user.tag} (${member.id}) for ${msDuration} for reason: ${reason}`
            );
        } catch (err) {
            logger.error('Error temp banning user. Error: ', err);
            return msg.util?.send('Error occured when trying to ban the user.');
        }

        const embed = getDefaultEmbed('GREEN')
            .setTitle('Banned')
            .addField('Reason', reason)
            .addField('User', member.user, true)
            .addField('Duration', msDuration, true)
            .addField('Moderator', msg.member.user, true);

        return msg.util?.send(embed);
    }
}

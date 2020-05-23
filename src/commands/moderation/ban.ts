import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import logger from '../../utils/logger';
import { logBan } from '../../structures/logManager';
import { Servers } from '../../models/server';
import { getDefaultEmbed } from '../../utils/message';
import { checkHigherOrEqualPermissions } from '../../utils/permissions';

export default class BanCommand extends Command {
    public constructor() {
        // TODO: Allow the ability to purge messages after a ban
        super('ban', {
            aliases: ['ban'],
            description: {
                content: 'Ban a user from the server.',
                usage: 'ban <user> [reason]',
                examples: [
                    'ban @temporis#6402',
                    'ban temporis ur bad',
                    'ban 111901076520767488 bad words',
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
        { member, reason }: { member: GuildMember; reason: string }
    ) {
        if (!member) {
            return msg.util?.send('Please specify a user to ban.');
        }

        // Checks so that you can not ban someone higher than you.
        if (await checkHigherOrEqualPermissions(msg, member))
            return msg.util.send(
                'That member has a higher or equal role to you. You are unable to ban them.'
            );

        let serversRepo = this.client.db.getRepository(Servers);

        try {
            // ban the user and send them a msg
            await member.ban({ reason: reason }).then(() => {
                member.send(
                    `You have been banned from ${member.guild.name} for the reason: *${reason}*`
                );
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

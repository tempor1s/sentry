import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import logger from '../../utils/logger';
import { Collection } from 'typeorm';
import { logKick } from '../../structures/logmanager';
import { Servers } from '../../models/server';
import { getDefaultEmbed } from '../../utils/message';

export default class KickCommand extends Command {
    public constructor() {
        // TODO: Allow the ability to purge messages after a kick
        super('kick', {
            aliases: ['kick'],
            description: {
                content: 'Kick a user from the server.',
                usage: 'purge <amount>',
                examples: [
                    'kick @temporis#6402',
                    'kick temporis',
                    'kick 111901076520767488',
                ],
            },
            category: 'moderation',
            channel: 'guild',
            clientPermissions: [
                Permissions.FLAGS.MANAGE_ROLES,
                Permissions.FLAGS.MANAGE_MESSAGES,
            ],
            userPermissions: [
                Permissions.FLAGS.MANAGE_ROLES,
                Permissions.FLAGS.MANAGE_MESSAGES,
            ],
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
            return msg.util?.send('Please specify a user to kick.');
        }

        // Checks so that you can not kick someone higher than you.
        if (
            member.roles.highest.position > msg.member.roles.highest.position &&
            msg.author.id !== msg.guild.ownerID
        ) {
            return msg.util.send(
                'This member has a higher or equal role to you. You are unable to kick them.'
            );
        }

        try {
            // TODO: Log kick as a mod action.
            // kick the user
            await member.kick(reason);
            logger.debug(
                `Kicked ${member.user.tag} (${member.id}) for reason: ${reason}`
            );
        } catch (err) {
            logger.error('Error kicking user. Error: ', err);
            msg.util?.send('Error occured when trying to kick user.');
        }

        const embed = getDefaultEmbed('GREEN')
            .setTitle('Kicked')
            .addField('Reason', reason, true)
            .addField('User', member.user, true)
            .addField('Moderator', msg.member.user, true);

        return msg.util?.send(embed);
    }
}

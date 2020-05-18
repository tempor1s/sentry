import { Command } from 'discord-akairo';
import { Message, GuildMember } from 'discord.js';
import { Repository } from 'typeorm';
import { Warnings } from '../../../models/warnings';
import { getDefaultEmbed } from '../../../utils/message';

export default class WarnAddCommand extends Command {
    public constructor() {
        super('warn-add', {
            category: 'moderation',
            userPermissions: 'MANAGE_MESSAGES',
            args: [
                {
                    id: 'member',
                    type: 'member',
                },
                {
                    id: 'reason',
                    type: 'string',
                    match: 'rest',
                    default: 'No reason provided.',
                },
            ],
        });
    }

    public async exec(
        msg: Message,
        { member, reason }: { member: GuildMember; reason: string }
    ) {
        if (!member) {
            return msg.util.send('User not specified / found.');
        }

        const warningRepo: Repository<Warnings> = this.client.db.getRepository(
            Warnings
        );

        // TODO: Create helper function for this.
        if (
            member.roles.highest.position >=
                msg.member.roles.highest.position &&
            msg.author.id !== msg.guild.ownerID
        )
            return msg.util.reply(
                getDefaultEmbed('RED')
                    .setTitle('Error')
                    .setDescription(
                        'This member has a higher or equal role to you. You are unable to warn them.'
                    )
            );

        await warningRepo.insert({
            guild: msg.guild.id,
            user: member.id,
            moderator: msg.author.id,
            reason: reason,
        });

        return msg.util.send(
            getDefaultEmbed('GREEN')
                .setTitle('User has been warned.')
                .addField('User', member.user, true)
                .addField('Moderator', msg.author, true)
                .addField('Reason', reason, true)
        );
    }
}

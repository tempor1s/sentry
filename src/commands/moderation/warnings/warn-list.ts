import { Command } from 'discord-akairo';
import { stripIndents } from 'common-tags';
import { Message, GuildMember } from 'discord.js';
import { Repository } from 'typeorm';
import { Warnings } from '../../../models/warnings';
import { getDefaultEmbed } from '../../../utils/message';
import * as moment from 'moment';
import 'moment-duration-format';

export default class WarnListCommand extends Command {
    public constructor() {
        super('warn-list', {
            category: 'moderation',
            userPermissions: 'MANAGE_MESSAGES',
            args: [
                {
                    id: 'member',
                    type: 'member',
                    match: 'content',
                },
            ],
        });
    }

    public async exec(
        msg: Message,
        { member }: { member: GuildMember }
    ): Promise<Message> {
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

        let warnings = await warningRepo.find({
            where: { guild: member.guild.id, user: member.id },
        });

        const embed = getDefaultEmbed().setTitle(
            `Warnings for ${member.user.tag}`
        );

        for (const warning of warnings) {
            let moderator = msg.guild.members.cache.get(warning.moderator);
            // TODO: Localize date time
            embed.addField(
                '**Warning**',
                stripIndents`ID: \`${
                    warning.id
                }\`\nModerator: ${moderator}\nReason: \`${
                    warning.reason
                }\`\nTime (UTC): \`${moment
                    .utc(warning.date)
                    .format('MM/DD/YYYY hh:mm')}\``,
                true
            );
        }

        return msg.util.send(embed);
    }
}

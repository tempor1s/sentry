import { Command } from 'discord-akairo';
import { stripIndents } from 'common-tags';
import { Message, GuildMember } from 'discord.js';
import { Repository } from 'typeorm';
import { Warnings } from '../../models/warnings';
import { getDefaultEmbed } from '../../utils/message';
import { MESSAGES } from '../../utils/constants';

export default class WarningsCommand extends Command {
    public constructor() {
        super('warnings', {
            aliases: ['warnings'],
            category: 'warnings',
            description: {
                content: MESSAGES.COMMANDS.WARNINGS.WARN.DESCRIPTION,
                usage: 'warnings [user]',
                examples: ['@temporis#6402', 'temporis', '111901076520767488'],
            },
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
            embed.addField(
                '**Warning**',
                stripIndents`ID: \`${warning.id}\`\nModerator: ${moderator}\nReason: \`${warning.reason}\``,
                true
            );
        }

        return msg.util.send(embed);
    }
}

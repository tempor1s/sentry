import { Command, Argument } from 'discord-akairo';
import { Message, GuildMember } from 'discord.js';
import { Repository } from 'typeorm';
import { Warnings } from '../../../models/warnings';
import { getDefaultEmbed } from '../../../utils/message';

export default class WarnRemoveCommand extends Command {
    public constructor() {
        super('warn-remove', {
            category: 'moderation',
            userPermissions: 'MANAGE_MESSAGES',
            args: [
                {
                    id: 'member',
                    type: 'member',
                },
                {
                    id: 'id',
                    type: 'number',
                },
            ],
        });
    }

    public async exec(
        msg: Message,
        { member, id }: { member: GuildMember; id: number }
    ) {
        if (!member) {
            return msg.util.send('User not specified / found.');
        }

        if (!id) {
            return msg.util.send('Please specify a warning ID to remove.');
        }

        const warningRepo: Repository<Warnings> = this.client.db.getRepository(
            Warnings
        );

        // TODO: Create helper function for this.
        if (
            member.roles.highest.position >=
                msg.member.roles.highest.position &&
            msg.author.id !== msg.guild.ownerID
        ) {
            return msg.util.reply(
                getDefaultEmbed('RED')
                    .setTitle('Error')
                    .setDescription(
                        'This member has a higher or equal role to you. You are unable to remove warnings from them.'
                    )
            );
        }

        try {
            let warning = await warningRepo.delete({
                guild: member.guild.id,
                user: member.id,
                id: id,
            });

            if (warning.affected > 0) {
                console.log(warning);
                const embed = getDefaultEmbed()
                    .setTitle('Removed Warning')
                    .addField('ID', id, true)
                    .addField('User', member.user, true)
                    .addField('Moderator', msg.member.user, true);

                return msg.util.send(embed);
            }

            return msg.util.send('Warning does not exist.');
        } catch (err) {
            return msg.util.send('Failed to remove warning.');
        }
    }
}

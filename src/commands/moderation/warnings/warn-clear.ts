import { Command } from 'discord-akairo';
import { Message, GuildMember, Permissions } from 'discord.js';
import { Repository } from 'typeorm';
import { Warnings } from '../../../models/warnings';

export default class WarnClearCommand extends Command {
    public constructor() {
        super('warn-clear', {
            category: 'moderation',
            clientPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_ROLES,
            ],
            userPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_ROLES,
            ],
            args: [
                {
                    id: 'member',
                    type: 'member',
                },
            ],
        });
    }

    public async exec(msg: Message, { member }: { member: GuildMember }) {
        if (!member) {
            return msg.util.send('User not specified / found.');
        }

        const warningRepo: Repository<Warnings> = this.client.db.getRepository(
            Warnings
        );

        // TODO: Create helper function for permission checking.
        if (
            member.roles.highest.position >=
                msg.member.roles.highest.position &&
            msg.author.id !== msg.guild.ownerID
        ) {
            return msg.util.send(
                'This member has a higher or equal role to you. You are unable to clear their warnings.'
            );
        }

        try {
            await warningRepo.delete({
                server: msg.guild.id,
                user: member.id,
            });

            return msg.util.send('Cleared all warnings.');
        } catch (err) {
            return msg.util.send('Failed to clear warnings.');
        }
    }
}

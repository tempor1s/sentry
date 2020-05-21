import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import logger from '../../../utils/logger';

export default class RolesAddAllCommand extends Command {
    public constructor() {
        super('roles-addall', {
            category: 'moderation',
            userPermissions: Permissions.FLAGS.MANAGE_ROLES,
            args: [
                {
                    id: 'role',
                    type: 'role',
                    match: 'content',
                },
            ],
        });
    }

    // TODO: Add role add all logging
    public async exec(msg: Message, { role }: { role: Role }) {
        if (!role) {
            return msg.util?.send('Please specify role to add to everyone.');
        }

        if (
            role.position >= msg.member.roles.highest.position &&
            msg.author.id !== msg.guild.ownerID
        ) {
            return msg.util?.send(
                'That role is in a higher position than your own. You are unable to assign it to others.'
            );
        }

        try {
            for (const member of msg.guild.members.cache.values()) {
                member.roles.add(role);

                logger.debug(
                    `Added role @${role.name} (${role.id}) to ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id})`
                );
            }
        } catch (err) {
            logger.error(
                `Error adding roles to everyone in ${msg.guild.name} (${msg.guild.id}). Error: `,
                err
            );

            return msg.util?.send('Error clearing roles to everyone.');
        }

        return msg.util?.send(`Added <@&${role.id}> to everyone.`);
    }
}
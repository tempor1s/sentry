import { Command } from 'discord-akairo';
import { Message, GuildMember, Permissions, Role } from 'discord.js';
import { Repository } from 'typeorm';
import { Warnings } from '../../../models/warnings';
import { getDefaultEmbed } from '../../../utils/message';
import logger from '../../../utils/logger';

export default class RolesAddCommand extends Command {
    public constructor() {
        super('roles-add', {
            category: 'moderation',
            userPermissions: Permissions.FLAGS.MANAGE_ROLES,
            args: [
                {
                    id: 'member',
                    type: 'member',
                },
                {
                    id: 'role',
                    type: 'role',
                    match: 'rest',
                },
            ],
        });
    }

    public async exec(
        msg: Message,
        { member, role }: { member: GuildMember; role: Role }
    ) {
        if (!member) {
            return msg.util?.send('Please specify user to add role to.');
        }

        if (!role) {
            return msg.util?.send('Please specify a role to give the user.');
        }

        // TODO: Create helper function for this.
        if (
            member.roles.highest.position > msg.member.roles.highest.position &&
            msg.author.id !== msg.guild.ownerID
        ) {
            return msg.util.send(
                'This member has a higher or equal role to you. You are unable to update their roles.'
            );
        }

        try {
            await member.roles.add(role);

            logger.debug(
                `Added role @${role.name} (${role.id}) to ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id})`
            );
        } catch (err) {
            logger.error(
                `Error adding role @${role.name} (${role.id}) to ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id}). Error: `,
                err
            );

            return msg.util?.send('Error adding role.');
        }

        return msg.util?.send(
            `Assigned role <@&${role.id}> to ${member.user}!`
        );
    }
}

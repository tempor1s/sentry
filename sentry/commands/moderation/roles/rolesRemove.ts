import { Command } from 'discord-akairo';
import { Message, GuildMember, Permissions, Role } from 'discord.js';
import logger from '../../../utils/logger';
import { logRoleRemove } from '../../../structures/logManager';
import {
  checkHigherOrEqualPermissions,
  checkHigherRole,
} from '../../../utils/permissions';

export default class RolesRemoveCommand extends Command {
  public constructor() {
    super('roles-remove', {
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
        },
      ],
    });
  }

  public async exec(
    msg: Message,
    { member, role }: { member: GuildMember; role: Role }
  ) {
    if (!member) {
      return msg.util?.send('Please specify user to remove role from.');
    }

    if (!role) {
      return msg.util?.send('Please specify a role to remove from the user.');
    }

    // dont want mods removing admins roles
    if (await checkHigherOrEqualPermissions(msg, member))
      return msg.util?.send(
        'This member has a higher or equal role to you. You are unable to remove their roles.'
      );

    // dont want mods removing other mod roles :)
    if (await checkHigherRole(msg, role))
      return msg.util?.send(
        'You are unable to remove roles that are higher than your own.'
      );

    try {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role).then(() => {
          logRoleRemove(member, msg.member!, role);
        });
      } else {
        return msg.util?.send('User does not have that role.');
      }

      logger.debug(
        `Removed role @${role.name} (${role.id}) from ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id})`
      );
    } catch (err) {
      logger.error(
        `Error removing role @${role.name} (${role.id}) from ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id}). Error: `,
        err
      );

      return msg.util?.send('Error removing role.');
    }

    return msg.util?.send(`Removed role <@&${role.id}> from ${member.user}!`);
  }
}

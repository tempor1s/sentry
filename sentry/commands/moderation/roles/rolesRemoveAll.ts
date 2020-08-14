import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import logger from '../../../utils/logger';
import { logRolesRemoveAll } from '../../../structures/logManager';
import { checkHigherRole } from '../../../utils/permissions';

export default class RolesRemoveAllCommand extends Command {
  public constructor() {
    super('roles-removeall', {
      category: 'moderation',
      userPermissions: Permissions.FLAGS.MANAGE_ROLES,
      args: [
        {
          id: 'role',
          type: 'role',
        },
      ],
    });
  }

  public async exec(msg: Message, { role }: { role: Role }) {
    if (!role) {
      return msg.util?.send('Please specify role to remove from everyone.');
    }

    if (await checkHigherRole(msg, role))
      return msg.util?.send(
        'That role is in a higher position than your own. You are unable to remove it from others.'
      );

    try {
      for (const member of msg.guild!.members.cache.values()) {
        member.roles.remove(role);

        logger.debug(
          `Removed role @${role.name} (${role.id}) from ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id})`
        );
      }
    } catch (err) {
      logger.error(
        `Error removing roles from everyone in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send('Error removing role from everyone.');
    }

    logRolesRemoveAll(role, msg.member!);

    return msg.util?.send(`Removed <@&${role.id}> from everyone.`);
  }
}

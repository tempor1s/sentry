import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import logger from '../../../utils/logger';
import { logRolesAddAll } from '../../../services/serverlogs';
import { checkHigherRole } from '../../../utils/permissions';

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

  public async exec(msg: Message, { role }: { role: Role }) {
    if (!role) {
      return msg.util?.send('Please specify role to add to everyone.');
    }

    if (await checkHigherRole(msg, role))
      return msg.util?.send(
        'That role is in a higher position than your own. You are unable to assign it to others.'
      );

    try {
      msg.util?.send(
        `Adding <@&${role.id}> to everyone. This might take a while...`
      );

      for (const member of msg.guild!.members.cache.values()) {
        await member.roles.add(role);

        logger.debug(
          `Added role @${role.name} (${role.id}) to ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id})`
        );
      }
    } catch (err) {
      logger.error(
        `Error adding roles to everyone in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send('Error adding role to everyone.');
    }

    logRolesAddAll(role, msg.member!);

    return msg.util?.send(`Added @${role.name} to everyone.`);
  }
}

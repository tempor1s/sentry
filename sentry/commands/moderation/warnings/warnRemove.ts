import logger from '../../../utils/logger';
import { Command } from 'discord-akairo';
import { Message, GuildMember, Permissions } from 'discord.js';
import { getDefaultEmbed } from '../../../utils/message';
import { checkHigherOrEqualPermissions } from '../../../utils/permissions';
import { removeSingleWarning } from '../../../services/warnings';

export default class WarnRemoveCommand extends Command {
  public constructor() {
    super('warn-remove', {
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
      return msg.util?.send('User not specified / found.');
    }

    if (!id) {
      return msg.util?.send('Please specify a warning ID to remove.');
    }

    if (await checkHigherOrEqualPermissions(msg, member))
      return msg.util?.reply(
        'This member has a higher or equal role to you. You are unable to remove warnings from them.'
      );

    try {
      const warning = await removeSingleWarning(msg.guild!.id, member.id, id);

      if (warning && warning.affected! > 0) {
        logger.debug(
          `Removed warning for ${member.user.tag} (${member.id}) in ${member.guild.name} (${member.guild.id})`
        );

        const embed = getDefaultEmbed()
          .setTitle('Removed Warning')
          .addField('ID', id, true)
          .addField('User', member.user, true)
          .addField('Moderator', msg.member!.user, true);

        return msg.util?.send(embed);
      }

      return msg.util?.send('Warning does not exist.');
    } catch (err) {
      logger.error(
        `Error removing warning for ${member.user.tag} (${member.id}) in ${member.guild.name} (${member.guild.id}). Error: `,
        err
      );

      return msg.util?.send('Failed to remove warning.');
    }
  }
}

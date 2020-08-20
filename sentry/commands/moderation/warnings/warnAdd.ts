import logger from '../../../utils/logger';
import { Command } from 'discord-akairo';
import { Message, GuildMember, Permissions } from 'discord.js';
import { getDefaultEmbed } from '../../../utils/message';
import { checkHigherOrEqualPermissions } from '../../../utils/permissions';
import { createWarning } from '../../../services/warnings';

export default class WarnAddCommand extends Command {
  public constructor() {
    super('warn-add', {
      category: 'moderation',
      userPermissions: Permissions.FLAGS.MANAGE_MESSAGES,
      args: [
        {
          id: 'member',
          type: 'member',
        },
        {
          id: 'reason',
          type: 'string',
          match: 'rest',
          default: 'No reason provided.',
        },
      ],
    });
  }

  public async exec(
    msg: Message,
    { member, reason }: { member: GuildMember; reason: string }
  ) {
    if (!member) {
      return msg.util?.send('User not specified / found.');
    }

    // do not want to be able to warn people higher than the executor
    if (await checkHigherOrEqualPermissions(msg, member))
      return msg.util?.send(
        'This member has a higher or equal role to you. You are unable to warn them.'
      );

    try {
      const inserted = await createWarning({
        server: msg.guild!.id,
        user: member.id,
        moderator: msg.author.id,
        reason: reason,
      });

      if (!inserted) return msg.util?.send('Error adding warning to user.');

      logger.debug(
        `Added warning to ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id}) with reason '${reason}'`
      );
    } catch (err) {
      logger.error(
        `Error adding warning to ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id}) with reason '${reason}'. Error: `,
        err
      );

      return msg.util?.send('Error adding warning to user.');
    }

    return msg.util?.send(
      getDefaultEmbed('GREEN')
        .setTitle('User has been warned.')
        .addField('User', member.user, true)
        .addField('Moderator', msg.author, true)
        .addField('Reason', reason, true)
    );
  }
}

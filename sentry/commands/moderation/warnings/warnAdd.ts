import logger from '../../../utils/logger';
import { Command } from 'discord-akairo';
import { Message, GuildMember, Permissions } from 'discord.js';
import { getDefaultEmbed, dmUser } from '../../../utils/message';
import { checkHigherOrEqualPermissions } from '../../../utils/permissions';
import { createWarning } from '../../../services/warnings';
import { getServerById } from '../../../services/server';

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
        {
          id: 'silent',
          match: 'flag',
          flag: ['--silent', '-s'],
          default: false,
        },
      ],
    });
  }

  public async exec(
    msg: Message,
    {
      member,
      reason,
      silent,
    }: { member: GuildMember; reason: string; silent: boolean }
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
      // create the new warning
      await createWarning({
        server: msg.guild!.id,
        user: member.id,
        moderator: msg.author.id,
        reason: reason,
      });

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

    if (silent === false)
      await dmUser(
        `You have been warned in ${
          msg.guild!.name
        } for the reason: *${reason}*`,
        member.user
      );

    return msg.util?.send(
      getDefaultEmbed('GREEN')
        .setTitle('User has been warned.')
        .addField('User', member.user, true)
        .addField('Moderator', msg.author, true)
        .addField('Reason', reason, true)
    );
  }
}

import logger from '../../../utils/logger';
import { Command } from 'discord-akairo';
import { Message, GuildMember, Permissions } from 'discord.js';
import { Repository } from 'typeorm';
import { Warnings } from '../../../models/warnings';
import { checkHigherOrEqualPermissions } from '../../../utils/permissions';

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
      return msg.util?.send('User not specified / found.');
    }

    const warningRepo: Repository<Warnings> = this.client.db.getRepository(
      Warnings
    );

    if (await checkHigherOrEqualPermissions(msg, member))
      return msg.util?.send(
        'This member has a higher or equal role to you. You are unable to clear their warnings.'
      );

    try {
      await warningRepo.delete({
        server: msg.guild.id,
        user: member.id,
      });

      logger.debug(
        `Cleared warnings from ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id})`
      );

      return msg.util?.send('Cleared all warnings.');
    } catch (err) {
      logger.error(
        `Error clearing warnings from ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id}). Error: `,
        err
      );

      return msg.util?.send('Failed to clear warnings.');
    }
  }
}

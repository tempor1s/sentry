import { Command } from 'discord-akairo';
import { Message, Permissions, User } from 'discord.js';
import logger from '../../utils/logger';
import { logUnban } from '../../structures/logManager';
import { Servers } from '../../models/server';

export default class UnbanCommand extends Command {
  public constructor() {
    // TODO: Allow the ability to purge messages after a ban
    super('unban', {
      aliases: ['unban'],
      description: {
        content: 'Unban a user from the server.',
        usage: 'unban <user> [reason]',
        examples: ['111901076520767488'],
      },
      category: 'moderation',
      channel: 'guild',
      clientPermissions: [Permissions.FLAGS.BAN_MEMBERS],
      userPermissions: [Permissions.FLAGS.BAN_MEMBERS],
      args: [
        {
          id: 'user',
          type: async (_, id) => {
            const user = await this.client.users.fetch(id);
            return user;
          },
        },
        {
          id: 'reason',
          type: 'string',
          match: 'rest',
          default: (_: Message) => 'No reason provided.',
        },
      ],
    });
  }

  public async exec(
    msg: Message,
    { user, reason }: { user: User; reason: string }
  ) {
    if (!user) {
      return msg.util?.send('Please specify a user to unban.');
    }

    let serversRepo = this.client.db.getRepository(Servers);

    try {
      // check to make sure the user is not already unbanned or not banned
      if (!(await msg.guild.fetchBan(user).catch(() => {}))) {
        return msg.util?.send('User is not banned.');
      }

      // log unban
      logUnban(serversRepo, user, msg.member, reason);
      await msg.guild.members.unban(user, reason);

      logger.debug(
        `Unbanned ${user.tag} (${user.id}) in server ${msg.guild.name} (${msg.guild.id})`
      );
    } catch (err) {
      logger.error('Error unbanning user. Error: ', err);
      return msg.util?.send('Error occured when trying to unban the user.');
    }

    return msg.util?.send('Successfully unbanned user.');
  }
}

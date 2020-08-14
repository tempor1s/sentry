import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import { Mutes } from '../../models/mutes';
import { Servers } from '../../models/server';
import { unmute } from '../../structures/muteManager';
import { logUnmute } from '../../structures/logManager';
import { checkHigherOrEqualPermissions } from '../../utils/permissions';
import { findMutedUser } from '../../services/mute';
import { getServerById } from '../../services/server';

export default class UnmuteCommand extends Command {
  public constructor() {
    super('unmute', {
      aliases: ['unmute', 'unsilence'],
      description: {
        content: 'Unmute a user in the discord server.',
        usage: 'unmute <user>',
        examples: ['@temporis#6402', 'temporis', '111901076520767488', 'temp'],
      },
      category: 'moderation',
      channel: 'guild',
      clientPermissions: [
        Permissions.FLAGS.MUTE_MEMBERS,
        Permissions.FLAGS.MANAGE_ROLES,
        Permissions.FLAGS.MANAGE_MESSAGES,
      ],
      userPermissions: [
        Permissions.FLAGS.MUTE_MEMBERS,
        Permissions.FLAGS.MANAGE_ROLES,
        Permissions.FLAGS.MANAGE_MESSAGES,
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
    // If they did not specify a member.
    if (!member) {
      return msg.util?.send('Please specify a user to unmute.');
    }

    // Check to make sure that we are not muting someone with an equal or higher role
    if (await checkHigherOrEqualPermissions(msg, member))
      return msg.util?.send(
        'This member has a higher or equal role to you. You are unable to unmute them.'
      );

    const mute = await findMutedUser(msg.guild!.id, member.id);
    const server = await getServerById(msg.guild!.id);

    if (!mute) {
      return msg.util?.send('That user is not muted.');
    }

    // TODO: Do not assume that the server has a muted role - could error
    await unmute(member, server!.mutedRole);
    logUnmute(member, msg.member!);

    return msg.util?.send(`Unmuted ${member.user}.`);
  }
}

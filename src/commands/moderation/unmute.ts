import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import { Mutes } from '../../models/mutes';
import { Servers } from '../../models/server';
import { unmute } from '../../structures/muteManager';
import { logUnmute } from '../../structures/logManager';
import { checkHigherOrEqualPermissions } from '../../utils/permissions';

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
      return msg.util.send(
        'This member has a higher or equal role to you. You are unable to unmute them.'
      );

    let mutesRepos = this.client.db.getRepository(Mutes);
    let serverRepo = this.client.db.getRepository(Servers);

    let server = await serverRepo.findOne({
      where: { server: msg.guild.id },
    });

    // TODO: Could just swap this over to checking user roles later if we need to optimize DB
    let mute = await mutesRepos.findOne({
      where: { server: msg.guild.id, user: member.id },
    });

    if (!mute) {
      return msg.util?.send('That user is not muted.');
    }

    await unmute(mutesRepos, member, server.mutedRole);
    logUnmute(serverRepo, member, msg.member);

    return msg.util?.send(`Unmuted ${member.user}.`);
  }
}

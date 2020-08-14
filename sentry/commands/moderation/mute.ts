import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';
import { Servers } from '../../models/server';
import { Mutes } from '../../models/mutes';
import { createMuteOrUpdate, mute } from '../../structures/muteManager';
import { logMute } from '../../structures/logManager';
import { checkHigherOrEqualPermissions } from '../../utils/permissions';
import ms from 'ms';
import { getServerById } from '../../services/server';
import { findMutedUser } from '../../services/mute';

export default class MuteCommand extends Command {
  public constructor() {
    super('mute', {
      aliases: ['mute', 'silence'],
      description: {
        content: 'Mute a user in the discord server.',
        usage: 'mute <user> [duration] [reason]',
        examples: [
          '@temporis#6402',
          '@temporis#6402 10m',
          '@temporis#6402 10m spamming',
          'temporis',
          '111901076520767488 10h',
          '@temporis#6402 30s -s',
        ],
      },
      category: 'moderation',
      channel: 'guild',
      userPermissions: [
        Permissions.FLAGS.MUTE_MEMBERS,
        Permissions.FLAGS.MANAGE_ROLES,
        Permissions.FLAGS.MANAGE_MESSAGES,
      ],
      clientPermissions: [
        Permissions.FLAGS.MUTE_MEMBERS,
        Permissions.FLAGS.MANAGE_ROLES,
        Permissions.FLAGS.MANAGE_MESSAGES,
      ],
      args: [
        {
          id: 'member',
          type: 'member',
        },
        {
          id: 'duration',
          type: (_: Message, str: string) => {
            if (str) {
              return Number(ms(str));
            }
            return 0;
          },
        },
        {
          id: 'reason',
          type: 'string',
          match: 'rest',
          default: (_: Message) => 'No reason provided.',
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
      duration,
      reason,
      silent,
    }: {
      member: GuildMember;
      duration: number;
      reason: string;
      silent: boolean;
    }
  ) {
    // If they did not specify a member.
    if (!member) {
      return msg.util?.send('Please specify a user to mute.');
    }

    // Check to make sure that we are not muting someone with an equal or higher role
    if (await checkHigherOrEqualPermissions(msg, member))
      return msg.util?.send(
        `That member has a higher or equal role to you. You are unable to mute them.`
      );

    const mutedUser = await findMutedUser(msg.guild!.id, member.id);

    if (mutedUser) {
      return msg.util?.send('That user is already muted.');
    }

    // Get the guild that we are going to be getting info for
    const server = await getServerById(msg.guild!.id);

    // If no user defined duration, then use servers default mute duration.
    if (!duration) {
      duration = server!.muteDuration;
    }

    // Get the ID of the 'muted' role.
    let muteRoleId = server?.mutedRole;
    if (!muteRoleId) {
      muteRoleId = await createMuteOrUpdate(msg.guild!);
    }

    // Mute the person
    await mute(msg, member, muteRoleId, reason, duration, silent);
    // Log the mute
    logMute(member, reason, duration, msg.member!);

    // Info sent to the channel for when the person is muted
    const embed = getDefaultEmbed('GREEN')
      .setTitle(`Muted ${member.user.tag}`)
      .addField('Reason', reason, true)
      .addField('Moderator', msg.member!.user, true)
      .addField('Mute Duration', ms(duration), true);

    return msg.util?.send(embed);
  }
}

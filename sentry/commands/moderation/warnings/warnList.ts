import { Command } from 'discord-akairo';
import { stripIndents } from 'common-tags';
import { Message, GuildMember, Permissions } from 'discord.js';
import { getDefaultEmbed } from '../../../utils/message';
import { checkHigherOrEqualPermissions } from '../../../utils/permissions';
import { utc } from 'moment';
import 'moment-duration-format';
import { getAllWarnings } from '../../../services/warnings';

export default class WarnListCommand extends Command {
  public constructor() {
    super('warn-list', {
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
          match: 'content',
        },
      ],
    });
  }

  public async exec(msg: Message, { member }: { member: GuildMember }) {
    if (!member) {
      return msg.util?.send('User not specified / found.');
    }

    if (await checkHigherOrEqualPermissions(msg, member))
      return msg.util?.send(
        'You may not view the warnings of someone with a higher rank than yourselves.'
      );

    const warnings = await getAllWarnings(member.guild.id, member.id);

    const embed = getDefaultEmbed().setTitle(`Warnings for ${member.user.tag}`);

    for (const warning of warnings) {
      let moderator = msg.guild!.members.cache.get(warning.moderator);
      // TODO: Localize date time
      embed.addField(
        '**Warning**',
        stripIndents`ID: \`${
          warning.id
        }\`\nModerator: ${moderator}\nReason: \`${
          warning.reason
        }\`\nTime (UTC): \`${utc(warning.date).format('MM/DD/YYYY hh:mm')}\``,
        true
      );
    }

    return msg.util?.send(embed);
  }
}

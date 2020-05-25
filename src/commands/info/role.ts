import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';
import { PERMISSIONS } from '../../utils/permissions';
import { utc } from 'moment';
import 'moment-duration-format';

export default class RoleInfoCommand extends Command {
  public constructor() {
    super('role', {
      aliases: ['role', 'roleinfo', 'role-info'],
      description: {
        content: 'Get information about a role in a server.',
        usage: 'role <role>',
        examples: ['mod', '@mod', '536334100055719954'],
      },
      category: 'info',
      channel: 'guild',
      clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
      args: [
        {
          id: 'role',
          match: 'content',
          type: 'role',
          default: (msg: Message) => msg.member?.roles.highest,
        },
      ],
    });
  }

  public async exec(msg: Message, { role }: { role: Role }) {
    const permissions = Object.keys(PERMISSIONS).filter(
      (permission) => role.permissions.serialize()[permission]
    );
    const embed = getDefaultEmbed()
      .setTitle(role.name)
      .addField('ID', role.id, false)
      .addField('Color', role.hexColor.toUpperCase(), true)
      .addField('Hoisted', role.hoist ? 'Yes' : 'No', true)
      .addField('Mentionable', role.mentionable ? 'Yes' : 'No', true)
      .addField(
        'Created at (UTC)',
        utc(role.createdAt).format('MM/DD/YYYY hh:mm'),
        true
      )
      .addField(
        'Permissions',
        permissions
          .map((permission) => `❯ ${PERMISSIONS[permission]}`)
          .join('\n') || 'None',
        false
      )
      .setThumbnail(msg.guild!.iconURL() ?? '');

    return msg.util?.send(embed);
  }
}

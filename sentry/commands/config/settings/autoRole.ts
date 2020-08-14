import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import { getServerById, updateServerById } from '../../../services/server';
import logger from '../../../utils/logger';

export default class AutoRoleConfigCommand extends Command {
  public constructor() {
    super('config-autorole', {
      description: {
        content: 'Update the autorole in the server.',
        usage: 'autorole [autorole]',
        examples: ['', '@Role', 'role', '712205605951242273'],
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      args: [
        {
          id: 'role',
          type: 'role',
        },
      ],
    });
  }

  public async exec(msg: Message, { role }: { role: Role }) {
    const server = await getServerById(msg.guild!.id);

    if (!role) {
      let roleMsg = server!.autoroleRole
        ? `<@&${server?.autoroleRole}>`
        : '`Not Set`';
      return msg.util?.send(`Current Autorole: ${roleMsg}`);
    }

    // update the muterole
    try {
      const updated = await updateServerById(msg.guild!.id, {
        autoroleRole: role.id,
      });

      if (updated) {
        logger.debug(
          `Updated Autorole in ${msg.guild!.name} (${msg.guild!.id}) to ${
            role.name
          } (${role.id})`
        );
      } else {
        logger.debug(
          `Failed to update autorole in ${msg.guild!.name} (${
            msg.guild!.id
          }) to ${role.name} (${role.id})`
        );

        return msg.util?.send('Error updating autorole role.');
      }
    } catch (err) {
      logger.error(
        `Error updating autorole role in ${msg.guild!.name} (${
          msg.guild!.id
        }). Error: `,
        err
      );

      return msg.util?.send('Error updating autorole role.');
    }

    return msg.util?.send(
      `The autorole has been set to <@&${role.id}> (${role.id})`
    );
  }
}

import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import { Servers } from '../../../models/server';
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
    let serverRepo = this.client.db.getRepository(Servers);
    let server = await serverRepo.findOne({
      where: { server: msg.guild!.id },
    });

    if (!role) {
      let roleMsg = server!.autoroleRole
        ? `<@&${server?.autoroleRole}>`
        : '`Not Set`';
      return msg.util?.send(`Current Autorole: ${roleMsg}`);
    }

    // update the muterole
    try {
      await serverRepo.update(
        { server: msg.guild!.id },
        { autoroleRole: role.id }
      );

      logger.debug(
        `Updated Autorole in ${msg.guild!.name} (${msg.guild!.id}) to ${
          role.name
        } (${role.id})`
      );
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

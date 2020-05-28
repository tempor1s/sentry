import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

export default class MuteRoleConfigCommand extends Command {
  public constructor() {
    super('config-muterole', {
      description: {
        content: 'Update the mute role in the server.',
        usage: 'muterole [muterole]',
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
      return msg.util?.send(
        `The current mute role for the server is <@&${server!.mutedRole}> (${
          server!.mutedRole
        })`
      );
    }

    // update the muterole
    try {
      await serverRepo.update(
        { server: msg.guild!.id },
        { mutedRole: role.id }
      );

      logger.debug(
        `Updating muted role in ${msg.guild?.name} (${msg.guild?.id}) to ${role.name} (${role.id})`
      );
    } catch (err) {
      logger.error(
        `Error updating mute role in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send('Error when updating the mute role.');
    }

    return msg.util?.send(`Updated Mute Role: <@&${role.id}>`);
  }
}

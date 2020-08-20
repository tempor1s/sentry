import { Command, Listener } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../utils/logger';
import { PERMISSIONS } from '../../utils/permissions';
import { getServerById } from '../../services/server';

export default class MissingPermissionsListener extends Listener {
  public constructor() {
    super('missingPermissions', {
      emitter: 'commandHandler',
      event: 'missingPermissions',
      category: 'commandHandler',
    });
  }

  public async exec(
    msg: Message,
    command: Command,
    type: string,
    missing: any
  ) {
    const server = await getServerById(msg.guild!.id);

    if (!server) return;

    if (!server.missingPermissionMessages) return;

    if (type === 'client') {
      logger.debug(
        `Missing client permissions for command ${command.aliases[0]}`
      );

      return msg.util?.send(
        `Missing Bot Permissions. Please give the bot \`Administrator\` permission for it to function correctly.`
      );
    } else {
      logger.debug(
        `Missing command user permissions for command ${
          command.aliases[0]
        }. Permssions: ${new Permissions(missing).toArray()}`
      );

      return msg.util?.send(
        `You are unable to use that command. Missing Permissions:\n${new Permissions(
          missing
        )
          .toArray(true)
          .map((permission) => `❯ **${PERMISSIONS[permission]}**`)
          .join('\n')}`
      );
    }
  }
}

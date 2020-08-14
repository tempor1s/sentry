import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class CommandLogToggleConfigCommand extends Command {
  public constructor() {
    super('config-commandlogtoggle', {
      description: {
        content: 'Enable/Disable command logging in the server.',
        usage: 'commandlogtoggle',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
    });
  }

  public async exec(msg: Message) {
    const server = await getServerById(msg.guild!.id);

    let flag = server?.commandLogEnabled ? false : true;

    // update the muterole
    try {
      const updated = updateServerById(msg.guild!.id, {
        commandLogEnabled: flag,
      });

      if (updated) {
        logger.debug(
          `Set command logging in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.error(
          `Error toggling command logging in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when toggling command logging. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling command logging in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling command logging. Please try again.'
      );
    }

    return msg.util?.send(`${flag ? 'Enabled' : 'Disabled'} command logging.`);
  }
}

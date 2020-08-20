import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class AutoRoleToggleConfigCommand extends Command {
  public constructor() {
    super('config-autoroletoggle', {
      description: {
        content: 'Enable/Disable auto role in the server.',
        usage: 'autoroletoggle',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
    });
  }

  public async exec(msg: Message) {
    const server = await getServerById(msg.guild!.id);

    let flag = server?.autoroleEnabled ? false : true;

    // update the muterole
    try {
      const updated = await updateServerById(msg.guild!.id, {
        autoroleEnabled: flag,
      });

      if (updated) {
        logger.debug(
          `Set autorole in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.error(
          `Error toggling autorole in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when toggling autorole. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling autorole in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send('Error when toggling autorole. Please try again.');
    }

    return msg.util?.send(`${flag ? 'Enabled' : 'Disabled'} autorole.`);
  }
}

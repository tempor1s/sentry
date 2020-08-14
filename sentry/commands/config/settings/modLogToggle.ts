import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class ModLogToggleConfigCommand extends Command {
  public constructor() {
    super('config-modlogtoggle', {
      description: {
        content: 'Enable/Disable mod action logging on the server.',
        usage: 'modlogtoggle',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
    });
  }

  public async exec(msg: Message) {
    const server = await getServerById(msg.guild!.id);

    let flag = server?.modLogEnabled ? false : true;

    // update the muterole
    try {
      const updated = await updateServerById(msg.guild!.id, {
        modLogEnabled: flag,
      });

      if (updated) {
        logger.debug(
          `Set mod action logging in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.error(
          `Error toggling mod action logging in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          'Error when toggling mod action logging. Please try again.'
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling mod action logging in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling mod action logging. Please try again.'
      );
    }

    return msg.util?.send(
      `${flag ? 'Enabled' : 'Disabled'} mod action logging.`
    );
  }
}

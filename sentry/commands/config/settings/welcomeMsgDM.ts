import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import { getServerById, updateServerById } from '../../../services/server';

export default class WelcomeMsgDMConfigCommand extends Command {
  public constructor() {
    super('config-welcomemsgdm', {
      description: {
        content:
          "Enable/Disable if the bot DM's the welcome message to the user if possible.",
        usage: 'welcomemsgtoggle',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
    });
  }

  public async exec(msg: Message) {
    const server = await getServerById(msg.guild!.id);

    let flag = server?.welcomeMessageSendDM ? false : true;

    // update if welcome message is enabled
    try {
      const updated = await updateServerById(msg.guild!.id, {
        welcomeMessageSendDM: flag,
      });

      if (updated) {
        logger.debug(
          `Set DM welcome message in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
        );
      } else {
        logger.error(
          `Error toggling DM welcome message in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send(
          "Error when toggling sending of welcome messages in DM's. Please try again."
        );
      }
    } catch (err) {
      logger.error(
        `Error toggling DM welcome message in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        "Error when toggling sending of welcome messages in DM's. Please try again."
      );
    }

    return msg.util?.send(
      `${flag ? 'Enabled' : 'Disabled'} the sending of welcome messages in DM.`
    );
  }
}

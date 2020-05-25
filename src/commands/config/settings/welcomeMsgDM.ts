import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

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
    let serverRepo = this.client.db.getRepository(Servers);
    let server = await serverRepo.findOne({
      where: { server: msg.guild.id },
    });

    let flag = server.welcomeMessageSendDM ? false : true;

    // update if welcome message is enabled
    try {
      await serverRepo.update(
        { server: msg.guild.id },
        { welcomeMessageSendDM: flag }
      );

      logger.debug(
        `Set DM welcome message in ${msg.guild.name} (${msg.guild.id}) to: ${flag}`
      );
    } catch (err) {
      logger.error(
        `Error toggling DM welcome message in ${msg.guild.name} (${msg.guild.id}). Error: `,
        err
      );

      return msg.util?.send(
        "Error when toggling sending of welcome messages in DM's. Please try again."
      );
    }

    return msg.util?.send(
      `Successfully ${
        flag ? 'enabled' : 'disabled'
      } the sending of welcome messages in DM.`
    );
  }
}

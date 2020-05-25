import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

export default class WelcomeMsgToggleConfigCommand extends Command {
  public constructor() {
    super('config-welcomemsgtoggle', {
      description: {
        content: 'Enable/Disable the welcome message in the server.',
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

    let flag = server.welcomeMessageEnabled ? false : true;

    // update if welcome message is enabled
    try {
      await serverRepo.update(
        { server: msg.guild.id },
        { welcomeMessageEnabled: flag }
      );

      logger.debug(
        `Set welcome message in ${msg.guild.name} (${msg.guild.id}) to: ${flag}`
      );
    } catch (err) {
      logger.error(
        `Error toggling welcome message in ${msg.guild.name} (${msg.guild.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling welcome message. Please try again.'
      );
    }

    return msg.util?.send(
      `Successfully ${flag ? 'enabled' : 'disabled'} welcome message.`
    );
  }
}

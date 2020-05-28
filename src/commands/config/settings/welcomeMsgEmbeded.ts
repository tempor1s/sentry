import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

export default class WelcomeMsgEmbededConfigCommand extends Command {
  public constructor() {
    super('config-welcomemsgembed', {
      description: {
        content: 'Enable/Disable if welcome message is embeded in the server.',
        usage: 'welcomemsgembed',
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
      where: { server: msg.guild!.id },
    });

    let flag = server?.welcomeMessageEmbeded ? false : true;

    // update if welcome message is enabled
    try {
      await serverRepo.update(
        { server: msg.guild!.id },
        { welcomeMessageEmbeded: flag }
      );

      logger.debug(
        `Set embeded welcome message in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
      );
    } catch (err) {
      logger.error(
        `Error toggling embeded welcome message in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling embeded welcome message. Please try again.'
      );
    }

    return msg.util?.send(
      `${flag ? 'Enabled' : 'Disabled'} embeded welcome message.`
    );
  }
}

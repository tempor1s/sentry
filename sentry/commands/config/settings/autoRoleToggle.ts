import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

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
    let serverRepo = this.client.db.getRepository(Servers);
    let server = await serverRepo.findOne({
      where: { server: msg.guild!.id },
    });

    let flag = server?.autoroleEnabled ? false : true;

    // update the muterole
    try {
      await serverRepo.update(
        { server: msg.guild!.id },
        { autoroleEnabled: flag }
      );

      logger.debug(
        `Set autorole in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
      );
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

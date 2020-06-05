import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

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
    let serverRepo = this.client.db.getRepository(Servers);
    let server = await serverRepo.findOne({
      where: { server: msg.guild!.id },
    });

    let flag = server?.commandLogEnabled ? false : true;

    // update the muterole
    try {
      await serverRepo.update(
        { server: msg.guild!.id },
        { commandLogEnabled: flag }
      );

      logger.debug(
        `Set command logging in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
      );
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

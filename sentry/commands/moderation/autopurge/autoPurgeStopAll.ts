import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { stopAllAutoPurge } from '../../../services/autopurge';

export default class AutoPurgeStopAllCommand extends Command {
  public constructor() {
    super('autopurge-stopall', {
      category: 'moderation',
      clientPermissions: [
        Permissions.FLAGS.MANAGE_MESSAGES,
        Permissions.FLAGS.MANAGE_CHANNELS,
      ],
      userPermissions: [
        Permissions.FLAGS.MANAGE_MESSAGES,
        Permissions.FLAGS.MANAGE_CHANNELS,
      ],
    });
  }

  public async exec(msg: Message) {
    // stop all auto purges on the server
    let removedPurges = await stopAllAutoPurge(msg.guild!.id);

    return msg.util?.send(
      removedPurges.affected
        ? `Stopped \`${removedPurges.affected}\` auto purge(s) from the server.`
        : 'There are no channel auto purges in this server.'
    );
  }
}

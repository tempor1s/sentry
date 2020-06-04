import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { setPrefix } from '../../../structures/prefixManager';

export default class PrefixConfigCommand extends Command {
  public constructor() {
    super('config-prefix', {
      aliases: ['prefix'],
      description: {
        content: 'View or update the prefix of the bot.',
        usage: 'prefix [prefix]',
        examples: ['', '>', 'pls'],
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      args: [
        {
          id: 'prefix',
          type: 'string',
        },
      ],
    });
  }

  public async exec(msg: Message, { prefix }: { prefix: string }) {
    await setPrefix(msg, this.client, this.handler, prefix);
  }
}

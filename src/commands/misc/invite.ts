import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';

export default class InviteCommand extends Command {
  public constructor() {
    super('invite', {
      aliases: ['invite'],
      category: 'misc',
      description: {
        content: 'Invite Sentry to your server.',
        usage: 'invite',
      },
    });
  }

  public async exec(msg: Message) {
    // TODO: Cache this on the instance? :)
    return msg.util?.send(
      getDefaultEmbed().setDescription(
        `**[Add Sentry to your server!](${this.client.invite})**`
      )
    );
  }
}

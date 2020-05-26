import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../utils/logger';
import { logPurge } from '../../structures/logManager';
import { Servers } from '../../models/server';

export default class PurgeCommand extends Command {
  public constructor() {
    // TODO: Allow the ability to purge messages only from a user.
    super('purge', {
      aliases: ['purge', 'clear', 'clean'],
      description: {
        content: 'Purge messages from a channel',
        usage: 'purge <amount>',
        examples: ['10', '100'],
      },
      category: 'moderation',
      channel: 'guild',
      clientPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],
      userPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],
      args: [
        {
          id: 'amount',
          type: 'number',
          match: 'content',
        },
      ],
    });
  }

  public async exec(msg: Message, { amount }: { amount: number }) {
    // TODO: Update this to remove max 1k msgs.
    if (!amount) {
      return msg.util?.send(
        'Please specify an amount of messages to purge. (Max 100)'
      );
    }

    let serverRepo = this.client.db.getRepository(Servers);

    // delete the first message so we do not need to deal with the math...
    await msg.delete();

    // if its less than 100 messages, just call a bulk delete on those
    let purgeSize: number;
    if (amount < 100) {
      try {
        const msgs = await msg.channel.bulkDelete(amount, true);
        purgeSize = msgs.size;
        logPurge(serverRepo, msg.member, purgeSize, msgs);

        logger.debug(
          `Purging ${msgs.size} messages in ${msg.guild.name} (${msg.guild.id})`
        );
      } catch (err) {
        logger.error(
          `Error purging messages in ${msg.guild.id} (${msg.guild.id})`
        );

        return msg.util?.send('Error purging messages.');
      }

      return msg.util?.send(
        `Deleted \`${purgeSize}\` message(s).${
          purgeSize < amount
            ? ' Less messages were probably purged due to messages being older than 2 weeks or other discord limitation.'
            : ''
        }`
      );
    } else {
      return msg.util?.send('Please specify an amount under 100.');
    }

    // let total = 0;
    // while (amount >= 101) {
    //     let amt = Math.min(100, amount - total);
    //     let msgs = await msg.channel.bulkDelete(amt, true);
    //
    //     if (amt !== msgs.size) {
    //         total += msgs.size;
    //         return msg.util?.send(
    //             `Deleted \`${total}\` messages. Less messages were probably purged due to messages being older than 2 weeks or other discord limitation.`
    //         );
    //     }
    //
    //     amount -= msgs.size;
    //     total += msgs.size;
    // }
    //
    // await msg.channel.bulkDelete(amount, true).then((msgs) => {
    //     amount += msgs.size;
    //     return msg.util?.send(`Deleted \`${total}\` messages.`);
    // });
  }
}

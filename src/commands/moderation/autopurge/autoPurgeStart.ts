import { Command } from 'discord-akairo';
import { stripIndents } from 'common-tags';
import { Message, Permissions, TextChannel } from 'discord.js';
import { AutoPurges } from '../../../models/autopurge';
import ms from 'ms';

export default class AutoPurgeStartCommand extends Command {
  public constructor() {
    super('autopurge-start', {
      category: 'moderation',
      clientPermissions: [
        Permissions.FLAGS.MANAGE_MESSAGES,
        Permissions.FLAGS.MANAGE_CHANNELS,
      ],
      userPermissions: [
        Permissions.FLAGS.MANAGE_MESSAGES,
        Permissions.FLAGS.MANAGE_CHANNELS,
      ],
      args: [
        {
          id: 'channel',
          type: 'channel',
        },
        {
          id: 'interval',
          type: (_: Message, str: string) => {
            if (str) {
              return Number(ms(str));
            }
            return 0;
          },
        },
      ],
    });
  }

  // TODO: Refactor into other file
  // TODO: Error handling :)
  public async exec(
    msg: Message,
    { channel, interval }: { channel: TextChannel; interval: number }
  ) {
    // no channel specified
    if (!channel) {
      return msg.util?.send('Please specify a channel to autopurge.');
    }

    // no interval specified
    if (!interval) {
      return msg.util?.send(
        stripIndents`Please specify an interval to purge the channel at.
                Min Duration: \`5 minutes\`
                Max Duration: \`14 days\``
      );
    }

    // less than 5 minutes greater or more than 2 weeks
    if (interval < 300000 || interval > 1.21e9) {
      return msg.util?.send(
        stripIndents`Specify an interval within the provided range.
                Min Duration: \`5 minutes\`
                Max Duration: \`14 days\``
      );
    }

    let autoPurgeRepo = this.client.db.getRepository(AutoPurges);

    let existingPurge = await autoPurgeRepo.findOne({
      where: { server: msg.guild.id, channel: channel.id },
    });

    // TODO: Maybe allow multiple purges per channel?
    // purge already exists on the channel
    if (existingPurge) {
      return msg.util?.send(
        'There is already an existing purge on this channel. Please remove it before adding a new one.'
      );
    }

    // add the auto-purge into the db
    await autoPurgeRepo.insert({
      server: msg.guild.id,
      channel: channel.id,
      timeUntilNextPurge: interval + Date.now(),
      purgeInterval: interval,
    });

    return msg.util?.send(
      `Auto purge started with an interval of \`${ms(interval)}\``
    );
  }
}

import ms from 'ms';
import { Command } from 'discord-akairo';
import { stripIndents } from 'common-tags';
import { Message, Permissions, TextChannel } from 'discord.js';
import { getDefaultEmbed } from '../../../utils/message';
import {
  getSingleAutoPurge,
  getAllAutoPurges,
} from '../../../services/autopurge';

export default class AutoPurgeShowCommand extends Command {
  public constructor() {
    super('autopurge-show', {
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
      ],
    });
  }

  public async exec(msg: Message, { channel }: { channel: TextChannel }) {
    // single channel
    if (channel) {
      // create embed and add purges that are for the specific channel
      const embed = getDefaultEmbed().setTitle('Channel Purge Info');

      const autoPurge = await getSingleAutoPurge(msg.guild!.id, channel.id);

      if (autoPurge) {
        embed.addField(
          '**Auto Purge**',
          stripIndents`
                        Time until next Purge: \`${
                          Number(autoPurge.timeUntilNextPurge) - Date.now() > 0
                            ? ms(
                                Number(autoPurge.timeUntilNextPurge) -
                                  Date.now()
                              )
                            : 'Purge Imminent'
                        }\`
                        Purge Iterval: \`${ms(
                          Number(autoPurge.purgeInterval)
                        )}\`
                        `,
          true
        );
      } else {
        embed.setDescription('There are no auto purges set for this channel.');
      }

      return msg.util?.send(embed);
    }

    // multi-channel
    const autoPurges = await getAllAutoPurges(msg.guild!.id);

    if (!autoPurges)
      return msg.util?.send(
        'There are currently no auto purges set for this server.'
      );

    // create embed and add all purges
    const embed = getDefaultEmbed().setTitle(
      `Auto Purges | ${msg.guild!.name}`
    );
    for (const autoPurge of autoPurges) {
      let purgeChannel = msg.guild!.channels.cache.get(autoPurge.channel);
      embed.addField(
        `**Channel**`,
        stripIndents`
                Channel: ${purgeChannel}
                Channel ID: \`${purgeChannel?.id}\` 
                Time until next Purge: \`${
                  Number(autoPurge.timeUntilNextPurge) - Date.now() > 0
                    ? ms(Number(autoPurge.timeUntilNextPurge) - Date.now())
                    : 'Purge Imminent'
                }\`
                Purge Iterval: \`${ms(Number(autoPurge.purgeInterval))}\`
                `,
        true
      );
    }

    return msg.util?.send(embed);
  }
}

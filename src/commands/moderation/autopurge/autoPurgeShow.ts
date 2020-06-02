import { Command } from 'discord-akairo';
import { stripIndents } from 'common-tags';
import { Message, Permissions, TextChannel } from 'discord.js';
import { AutoPurges } from '../../../models/autopurge';
import { getDefaultEmbed } from '../../../utils/message';
import ms from 'ms';

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
    const autoPurgeRepo = this.client.db.getRepository(AutoPurges);

    // single channel
    if (channel) {
      // create embed and add purges that are for the specific channel
      const embed = getDefaultEmbed().setTitle('Channel Purge Info');

      let autoPurge = await autoPurgeRepo.findOne({
        where: { server: msg.guild!.id, channel: channel.id },
      });

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
    let autoPurges = await autoPurgeRepo.find({
      where: { server: msg.guild!.id },
    });

    // create embed and add all purges
    const embed = getDefaultEmbed().setTitle(
      `Auto Purged Channels | ${msg.guild!.name}`
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

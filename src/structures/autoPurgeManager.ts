import { TextChannel } from 'discord.js';
import { AkairoClient } from 'discord-akairo';
import { Repository } from 'typeorm';
import logger from '../utils/logger';
import { logAutoPurge } from '../structures/logManager';

import { AutoPurges } from '../models/autopurge';
import { Servers } from '../models/server';

export async function autoPurgeLoop(
    serversRepo: Repository<Servers>,
    autoPurgeRepo: Repository<AutoPurges>,
    client: AkairoClient
) {
    const autoPurges = await autoPurgeRepo.find();
    autoPurges
        .filter((p) => p.timeUntilNextPurge <= Date.now())
        .map(async (p) => {
            // get the channel that we are going to purge
            let channel = client.channels.cache.get(p.channel) as TextChannel;

            // get all the messages in the channel
            let messages = await channel.messages.fetch(
                {
                    limit: 100000000,
                },
                false
            );
            // filter out all messages that are pinned
            let filteredMsgs = messages.filter((msg) => !msg.pinned);
            // delete messages that are not pinned
            await channel.bulkDelete(filteredMsgs);

            channel.send('Channel purged! :)');

            logger.debug(
                `Purging ${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id}) due to auto purge.`
            );

            // log when we purge a channel
            logAutoPurge(serversRepo, messages.size, channel);

            // update our time till next purge to be date.now() + the set interval
            await autoPurgeRepo.update(
                { server: p.server, channel: p.channel },
                {
                    timeUntilNextPurge: Number(p.purgeInterval) + Date.now(),
                }
            );
        });
}

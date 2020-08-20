import { AkairoClient } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import logger from '../utils/logger';
import { logAutoPurge } from './serverlogs';
import { getRepository } from 'typeorm';
import { AutoPurges } from '../models/autoPurge';
import { Servers } from '../models/server';
import { getServerById } from './server';

export const getSingleAutoPurge = async (serverId: string, channel: string) => {
  const repo = getRepository(AutoPurges);

  return repo.findOne({ where: { server: serverId, channel } });
};

export const getAllAutoPurges = async (
  serverId: string
): Promise<AutoPurges[] | undefined> => {
  const server = await getServerById(serverId);

  return server?.channelPurges;
};

interface CreateAutoPurge {
  server: Servers;
  channel: string;
  timeUntilNextPurge: number; // ms
  purgeInterval: number;
}

export const startAutoPurge = async (
  purgeData: CreateAutoPurge
): Promise<boolean> => {
  const repo = getRepository(AutoPurges);

  const result = await repo.insert(purgeData);

  if (!result) return false;

  return true;
};

export const stopSingleAutoPurge = async (
  channel: string
): Promise<boolean> => {
  const repo = getRepository(AutoPurges);

  const result = await repo.delete({ channel });

  if (!result) return false;

  return true;
};

export const stopAllAutoPurge = async (serverId: string): Promise<number> => {
  const server = await getServerById(serverId);
  let count = 0;

  if (!server) {
    return count;
  }

  // get rid of all channel purges for the server
  if (server.channelPurges) {
    count = server.channelPurges.length;

    server.channelPurges = [];
    await server?.save();
  }

  return count;
};

export async function autoPurgeLoop(client: AkairoClient) {
  const autoPurgeRepo = getRepository(AutoPurges);

  const autoPurges = await autoPurgeRepo.find();
  autoPurges
    .filter((p) => p.timeUntilNextPurge <= Date.now())
    .map(async (p) => {
      // get the channel that we are going to purge
      let channel = client.channels.cache.get(p.channel) as TextChannel;

      // get all the messages in the channel
      let messages = await channel.messages.fetch(
        {
          limit: 100,
        },
        false
      );
      // filter out all messages that are pinned
      let filteredMsgs = messages.filter((msg) => !msg.pinned);
      // delete messages that are not pinned
      await channel.bulkDelete(filteredMsgs);

      await channel.send('Channel purged! :)');

      logger.debug(
        `Purging ${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id}) due to auto purge.`
      );

      // log when we purge a channel
      logAutoPurge(messages.size, channel);

      // update our time till next purge to be date.now() + the set interval
      await autoPurgeRepo.update(
        { server: p.server, channel: p.channel },
        {
          timeUntilNextPurge: Number(p.purgeInterval) + Date.now(),
        }
      );
    });
}

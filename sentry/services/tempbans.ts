import { getRepository } from 'typeorm';
import { AkairoClient } from 'discord-akairo';
import { logUnban } from './serverlogs';

import { TempBans } from '../models/tempBans';
import { Servers } from '../models/server';

interface CreateTempBan {
  server: Servers;
  user: string;
  end: number;
  reason: string;
  moderator: string;
}

export const createTempBan = async (tempBanData: CreateTempBan) => {
  const repo = getRepository(TempBans);
  return await repo.insert(tempBanData);
};

export async function tempUnbanLoop(client: AkairoClient) {
  const tempBanRepo = getRepository(TempBans);

  const tempBans = await tempBanRepo.find();
  tempBans
    .filter((ban) => ban.end <= Date.now())
    .map(async (ban) => {
      await tempBanRepo.delete({
        server: ban.server,
        user: ban.user,
      });
      // get the server to remove ban from
      const server = client.guilds.cache.get(ban.server.id);
      // the bot member in the server
      const botMember = server!.members.cache.get(client.user!.id);
      // remove ban
      const user = await server!.members.unban(ban.user);
      // log unban
      logUnban(user, botMember!, 'Temporary ban expired.');
    });
}

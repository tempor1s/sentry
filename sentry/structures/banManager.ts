import { AkairoClient } from 'discord-akairo';
import { getRepository } from 'typeorm';
import { logUnban } from '../structures/logManager';
import { TempBans } from '../models/tempBans';

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
      let server = client.guilds.cache.get(ban.server);
      // the bot member in the server
      let botMember = server!.members.cache.get(client.user!.id);
      // remove ban
      let user = await server!.members.unban(ban.user);
      // log unban
      logUnban(user, botMember!, 'Temporary ban expired.');
    });
}

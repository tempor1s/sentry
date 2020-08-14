import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';
import { Servers } from '../../models/server';
import { getRepository } from 'typeorm';
import { createMuteOrUpdate } from '../../structures/muteManager';
import logger from '../../utils/logger';

export default class BotJoinListener extends Listener {
  public constructor() {
    super('botJoin', {
      emitter: 'client',
      event: 'guildCreate',
    });
  }

  public async exec(guild: Guild) {
    // TODO: Send message to 'main' channel when the bot joins.
    const serversRepo = getRepository(Servers);

    // Created muted role on join or take over the one that already exists.
    await createMuteOrUpdate(guild);

    // Create a new DB entry when the bot joins a server.
    try {
      await serversRepo.insert({ server: guild.id });
      logger.info(
        `Bot joined ${guild.name} (${guild.id}) with ${guild.members.cache.size} members.`
      );
    } catch (err) {
      logger.error(
        `Error creating DB entry when joining ${guild.name} (${guild.id}). Reason: `,
        err
      );
    }
  }
}

import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';
import { createMuteOrUpdate } from '../../services/mute';
import logger from '../../utils/logger';
import { createServerById } from '../../services/server';

export default class BotJoinListener extends Listener {
  public constructor() {
    super('botJoin', {
      emitter: 'client',
      event: 'guildCreate',
    });
  }

  public async exec(guild: Guild) {
    // TODO: Send message to 'main' channel when the bot joins.

    // Created muted role on join or take over the one that already exists.
    await createMuteOrUpdate(guild);

    // Create a new DB entry when the bot joins a server.
    try {
      const created = await createServerById(guild.id);

      if (created) {
        logger.info(
          `Bot joined ${guild.name} (${guild.id}) with ${guild.members.cache.size} members.`
        );
      } else {
        logger.error(
          `Bot joined ${guild.name} (${guild.id}) with ${guild.members.cache.size} members, but we failed to create a db entry.`
        );
      }
    } catch (err) {
      logger.error(
        `Error creating DB entry when joining ${guild.name} (${guild.id}). Reason: `,
        err
      );
    }
  }
}

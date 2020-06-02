import { Listener } from 'discord-akairo';
import { unmuteLoop } from '../../structures/muteManager';
import { autoPurgeLoop } from '../../structures/autoPurgeManager';
import { tempUnbanLoop } from '../../structures/banManager';
import { unlockChannelLoop } from '../../structures/lockManager';
import { Repository } from 'typeorm';
import logger from '../../utils/logger';

import { Mutes } from '../../models/mutes';
import { AutoPurges } from '../../models/autoPurge';
import { TempBans } from '../../models/tempBans';
import { Servers } from '../../models/server';
import { ChannelLocks } from '../../models/channelLocks';

export default class ReadyListener extends Listener {
  public constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
      category: 'client',
    });
  }

  public async exec() {
    logger.info(`${this.client.user!.tag} is now online.`);

    const mutesRepo: Repository<Mutes> = this.client.db.getRepository(Mutes);
    const serversRepo: Repository<Servers> = this.client.db.getRepository(
      Servers
    );
    const autoPurgeRepo: Repository<AutoPurges> = this.client.db.getRepository(
      AutoPurges
    );
    const tempBanRepo: Repository<TempBans> = this.client.db.getRepository(
      TempBans
    );
    const channelLockrepo: Repository<ChannelLocks> = this.client.db.getRepository(
      ChannelLocks
    );

    // Update servers/members every 5 minutes.
    this.client.user!.setActivity(
      `${this.client.guilds.cache.size} servers | ${this.client.users.cache.size} members`,
      { type: 'WATCHING' }
    );

    // update activity every 5mins with new server/member count
    setInterval(() => {
      this.client.user!.setActivity(
        `${this.client.guilds.cache.size} servers | ${this.client.users.cache.size} members`,
        { type: 'WATCHING' }
      );
    }, 3e5);

    // Unmute loop (runs every 30 seconds)
    setInterval(
      async () => unmuteLoop(serversRepo, mutesRepo, this.client),
      30000
    );

    // purge auto purged channels (runs every 30 seconds)
    setInterval(
      async () => autoPurgeLoop(serversRepo, autoPurgeRepo, this.client),
      30000
    );

    // unban users that are past the interval (runs every 5 minutes)
    setInterval(
      async () => tempUnbanLoop(serversRepo, tempBanRepo, this.client),
      3e5
    );

    // check if we need to unlock any channels :) (runs every minute)
    setInterval(
      async () => unlockChannelLoop(serversRepo, channelLockrepo, this.client),
      10000
    );
  }
}

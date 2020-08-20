import { Listener } from 'discord-akairo';
import { unmuteLoop } from '../../services/mute';
import { autoPurgeLoop } from '../../services/autopurge';
import { tempUnbanLoop } from '../../services/tempbans';
import { unlockChannelLoop } from '../../services/channellocks';
import logger from '../../utils/logger';

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

    await this.client.user!.setActivity(`from sentrybot.io`, {
      type: 'WATCHING',
    });

    setInterval(async () => {
      await this.client.user!.setActivity(`from sentrybot.io`, {
        type: 'WATCHING',
      });
    }, 3e5);

    // Unmute loop (runs every 30 seconds)
    setInterval(async () => unmuteLoop(this.client), 30000);

    // purge auto purged channels (runs every 30 seconds)
    setInterval(async () => autoPurgeLoop(this.client), 30000);

    // unban users that are past the interval (runs every 5 minutes)
    setInterval(async () => tempUnbanLoop(this.client), 3e5);

    // check if we need to unlock any channels :) (runs every minute)
    setInterval(async () => unlockChannelLoop(this.client), 60000);
  }
}

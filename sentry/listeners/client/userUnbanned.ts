import { Listener } from 'discord-akairo';
import { Guild, User } from 'discord.js';
import { logUnban } from '../../structures/logManager';

export default class UserUnbannedListener extends Listener {
  public constructor() {
    super('userUnbannedListener', {
      emitter: 'client',
      event: 'guildBanRemove',
    });
  }

  public async exec(guild: Guild, user: User) {
    let auditLogs = await guild.fetchAuditLogs();
    // TODO: This might fail. Maybe sort through the first 1-10 and find the EXACT action? :)
    let unbanAction = auditLogs.entries.first();

    if (!unbanAction) return;

    // dont log actions that are done by the bot because it will already be logged through the ban action
    if (unbanAction.executor.id == this.client.user!.id) return;

    // log the user banned
    logUnban(
      user,
      guild.members.cache.get(unbanAction.executor.id)!,
      unbanAction.reason ? unbanAction.reason : 'No reason provided.'
    );
  }
}

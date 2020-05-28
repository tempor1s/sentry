import { Listener } from 'discord-akairo';
import { Guild, User } from 'discord.js';
import { Servers } from '../../models/server';
import { Repository } from 'typeorm';
import { logBan } from '../../structures/logManager';

export default class UserBannedListener extends Listener {
  public constructor() {
    super('userBannedListener', {
      emitter: 'client',
      event: 'guildBanAdd',
    });
  }

  public async exec(guild: Guild, user: User) {
    const serversRepo: Repository<Servers> = this.client.db.getRepository(
      Servers
    );

    let auditLogs = await guild.fetchAuditLogs();
    // TODO: This might fail. Maybe sort through the first 1-10 and find the EXACT action? :)
    let banAction = auditLogs.entries.first();

    // dont log actions that are done by the bot because it will already be logged through the ban action
    if (banAction!.executor.id === this.client.user!.id) return;

    // log the user banned
    logBan(
      serversRepo,
      user,
      banAction!.reason ? banAction!.reason : 'No reason provided.',
      guild.members.cache.get(banAction!.executor.id)!
    );
  }
}

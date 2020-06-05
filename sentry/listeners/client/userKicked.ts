import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { Servers } from '../../models/server';
import { Repository } from 'typeorm';
import { logKick } from '../../structures/logManager';

export default class UserKickedListener extends Listener {
  public constructor() {
    super('userKickedListener', {
      emitter: 'client',
      event: 'guildMemberRemove',
    });
  }

  public async exec(member: GuildMember) {
    const serversRepo: Repository<Servers> = this.client.db.getRepository(
      Servers
    );

    let auditLogs = await member.guild.fetchAuditLogs();
    // TODO: This might fail. Maybe sort through the first 1-10 and find the EXACT action? :)
    let possibleKickAction = auditLogs.entries.first();

    if (!possibleKickAction) return;

    // ignore if not a kick event
    if (possibleKickAction.action !== 'MEMBER_KICK') return;
    // dont log actions that are done by the bot because it will already be logged through the kick action
    if (possibleKickAction.executor.id == this.client.user!.id) return;

    logKick(
      serversRepo,
      member,
      possibleKickAction.reason
        ? possibleKickAction.reason
        : 'No reason provided.',
      member.guild.members.cache.get(possibleKickAction.executor.id)!
    );
  }
}

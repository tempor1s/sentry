import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import logger from '../../utils/logger';
import { logLeaveMsg } from '../../structures/logManager';

export default class LeaveMsgListener extends Listener {
  public constructor() {
    super('leaveMsgListener', {
      emitter: 'client',
      event: 'guildMemberRemove',
    });
  }

  public async exec(member: GuildMember) {
    // Add the muted role
    try {
      // log join
      logLeaveMsg(member);
    } catch (err) {
      logger.error(
        `Error logging member leave in ${member.guild.name} (${member.guild.id}). Reason: `,
        err
      );
    }
  }
}

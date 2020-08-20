import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import logger from '../../utils/logger';
import { logLeaveMsg } from '../../services/serverlogs';

export default class LeaveMsgListener extends Listener {
  public constructor() {
    super('leaveMsgListener', {
      emitter: 'client',
      event: 'guildMemberRemove',
    });
  }

  public async exec(member: GuildMember) {
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

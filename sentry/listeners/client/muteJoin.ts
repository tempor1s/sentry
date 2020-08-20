import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import logger from '../../utils/logger';
import { logMute } from '../../services/serverlogs';
import { findMutedUser } from '../../services/mute';
import { getServerById } from '../../services/server';

export default class MuteJoinListener extends Listener {
  public constructor() {
    super('muteJoinListener', {
      emitter: 'client',
      event: 'guildMemberAdd',
    });
  }

  public async exec(member: GuildMember) {
    const muted = await findMutedUser(member.guild.id, member.id);

    if (!muted) {
      return;
    }

    const server = await getServerById(member.guild.id);

    // Add the muted role
    try {
      await member.roles.add(
        server!.mutedRole,
        `Muted | Reason: Left and rejoined while muted.`
      );

      logger.info(
        `Remuted ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id}) because they left and rejoined while muted.`
      );

      await member.send('Nice try mute evading...');

      logMute(
        member,
        'Mute Evading | Remute',
        muted.end - Date.now(),
        member.guild.members.cache.get(this.client.user!.id)!
      );
    } catch (err) {
      logger.error(
        `Error occured when remuting ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id}) when they rejoined. Reason: `,
        err
      );
    }
  }
}

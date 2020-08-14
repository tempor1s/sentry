import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { Servers } from '../../models/server';
import { getRepository } from 'typeorm';
import { Mutes } from '../../models/mutes';
import logger from '../../utils/logger';
import { logMute } from '../../structures/logManager';

export default class MuteJoinListener extends Listener {
  public constructor() {
    super('muteJoinListener', {
      emitter: 'client',
      event: 'guildMemberAdd',
    });
  }

  public async exec(member: GuildMember) {
    const serversRepo = getRepository(Servers);
    const mutesRepo = getRepository(Mutes);

    let muted = await mutesRepo.findOne({
      where: { server: member.guild.id, user: member.id },
    });

    if (!muted) {
      return;
    }

    let server = await serversRepo.findOne({
      where: { server: member.guild.id },
    });

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

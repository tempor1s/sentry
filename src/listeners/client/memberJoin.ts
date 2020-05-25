import { Listener } from 'discord-akairo';
import { GuildMember, TextChannel } from 'discord.js';
import { Servers } from '../../models/server';
import { Repository } from 'typeorm';
import logger from '../../utils/logger';
import { logJoinMsg } from '../../structures/logManager';
import { getDefaultEmbed } from '../../utils/message';

export default class MemberJoinListener extends Listener {
  public constructor() {
    super('joinMsgListener', {
      emitter: 'client',
      event: 'guildMemberAdd',
    });
  }

  public async exec(member: GuildMember) {
    const serversRepo: Repository<Servers> = this.client.db.getRepository(
      Servers
    );

    let server = await serversRepo.findOne({
      where: { server: member.guild.id },
    });

    try {
      // log join
      logJoinMsg(server, member);

      // TODO: Refactor out possibly
      // send welcome message if enabled
      if (server.welcomeMessageEnabled) {
        let channel = member.guild.channels.cache.get(
          server.welcomeChannel
        ) as TextChannel;

        // format the message
        let welcomeMessage = server.welcomeMessage
          .replace('{name}', `${member.user}`)
          .replace('{server}', member.guild.name);

        if (server.welcomeMessageEmbeded) {
          let embed = getDefaultEmbed()
            .setTitle('Welcome!')
            .setDescription(welcomeMessage);
          if (server.welcomeMessageSendDM) {
            try {
              await member.send(embed);
              return;
            } catch (err) {
              await channel.send(embed);
              return;
            }
          }

          await channel.send(embed);
          return;
        }

        if (server.welcomeMessageSendDM) {
          try {
            await member.send(welcomeMessage);
            return;
          } catch (err) {
            await channel.send(welcomeMessage);
            return;
          }
        }

        channel.send(welcomeMessage);
      }
    } catch (err) {
      logger.error(
        `Error logging member join in ${member.guild.name} (${member.guild.id}). Reason: `,
        err
      );
    }
  }
}

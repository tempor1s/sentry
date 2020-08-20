import { Listener } from 'discord-akairo';
import { GuildMember, TextChannel } from 'discord.js';
import logger from '../../utils/logger';
import { logJoinMsg } from '../../services/serverlogs';
import { getDefaultEmbed } from '../../utils/message';
import { getServerById } from '../../services/server';

export default class MemberJoinListener extends Listener {
  public constructor() {
    super('joinMsgListener', {
      emitter: 'client',
      event: 'guildMemberAdd',
    });
  }

  public async exec(member: GuildMember) {
    const server = await getServerById(member.guild.id);

    try {
      // log join
      logJoinMsg(member);

      // send welcome message if enabled
      if (server?.welcomeMessageEnabled) {
        const channel = member.guild.channels.cache.get(
          server.welcomeChannel
        ) as TextChannel;

        // format the message
        const welcomeMessage = server.welcomeMessage
          .replace('{name}', `${member.user}`)
          .replace('{server}', member.guild.name);

        if (server.welcomeMessageEmbeded) {
          const embed = getDefaultEmbed()
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

        await channel.send(welcomeMessage);
      }
    } catch (err) {
      logger.error(
        `Error logging member join in ${member.guild.name} (${member.guild.id}). Reason: `,
        err
      );
    }
  }
}

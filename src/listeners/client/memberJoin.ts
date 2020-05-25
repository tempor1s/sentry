import { Listener } from 'discord-akairo';
import { GuildMember, TextChannel } from 'discord.js';
import { Servers } from '../../models/server';
import { Repository } from 'typeorm';
import logger from '../../utils/logger';
import { logJoinMsg } from '../../structures/logManager';

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

        // Add the muted role
        try {
            // log join
            logJoinMsg(server, member);

            // send welcome message if enabled
            if (server.welcomeMessageEnabled) {
                let channel = member.guild.channels.cache.get(
                    server.welcomeChannel
                ) as TextChannel;

                // format the message
                let welcomeMessage = server.welcomeMessage
                    .replace('{name}', `${member.user}`)
                    .replace('{server}', member.guild.name);

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

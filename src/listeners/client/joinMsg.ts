import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { Servers } from '../../models/server';
import { Repository } from 'typeorm';
import logger from '../../utils/logger';
import { logJoinMsg } from '../../structures/logmanager';

export default class JoinMsgListener extends Listener {
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

        // Add the muted role
        try {
            // log join
            logJoinMsg(serversRepo, member);
        } catch (err) {
            logger.error(
                `Error logging member join in ${member.guild.name} (${member.guild.id}). Reason: `,
                err
            );
        }
    }
}

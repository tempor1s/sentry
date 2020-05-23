import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { Servers } from '../../models/server';
import { Repository } from 'typeorm';
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
        const serversRepo: Repository<Servers> = this.client.db.getRepository(
            Servers
        );

        // Add the muted role
        try {
            // log join
            logLeaveMsg(serversRepo, member);
        } catch (err) {
            logger.error(
                `Error logging member leave in ${member.guild.name} (${member.guild.id}). Reason: `,
                err
            );
        }
    }
}

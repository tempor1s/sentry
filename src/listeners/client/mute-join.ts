import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { Servers } from '../../models/server';
import { Repository } from 'typeorm';
import { Mutes } from '../../models/mutes';

export default class MuteJoinListener extends Listener {
    public constructor() {
        super('muteJoinListener', {
            emitter: 'client',
            event: 'guildMemberAdd',
        });
    }

    public async exec(member: GuildMember) {
        const serversRepo: Repository<Servers> = this.client.db.getRepository(
            Servers
        );
        const mutesRepo: Repository<Mutes> = this.client.db.getRepository(
            Mutes
        );

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
        await member.roles
            .add(
                server.mutedRole,
                `Muted | Reason: Left and rejoined while muted.`
            )
            .catch((err) => {
                console.log(err);
            });

        await member.send('Nice try mute evading...');
    }
}

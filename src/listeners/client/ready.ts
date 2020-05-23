import { Listener } from 'discord-akairo';
import { Mutes } from '../../models/mutes';
import { Servers } from '../../models/server';
import { unmute } from '../../structures/muteManager';
import { logUnmute } from '../../structures/logmanager';
import logger from '../../utils/logger';

export default class ReadyListener extends Listener {
    public constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
            category: 'client',
        });
    }

    public async exec() {
        logger.info(`${this.client.user.tag} is now online.`);

        const mutesRepo = this.client.db.getRepository(Mutes);
        const serversRepo = this.client.db.getRepository(Servers);

        // Update servers/members every 5 minutes.
        this.client.user.setActivity(
            `${this.client.guilds.cache.size} servers | ${this.client.users.cache.size} members`,
            { type: 'WATCHING' }
        );

        // update activity every 5mins with new server/member count
        setInterval(() => {
            this.client.user.setActivity(
                `${this.client.guilds.cache.size} servers | ${this.client.users.cache.size} members`,
                { type: 'WATCHING' }
            );
        }, 3e5);

        // Unmute loop
        // TODO: Move this into mute strcture as a refactor to clean this up
        setInterval(async () => {
            const mutes = await mutesRepo.find();
            mutes
                .filter((m) => m.end <= Date.now())
                .map(async (m) => {
                    let guild = this.client.guilds.cache.get(m.server);
                    let member = guild.members.cache.get(m.user);
                    // TODO: This is slow. Optimize with relations or something? :)
                    let serverDb = await serversRepo.findOne({
                        where: { server: m.server },
                    });

                    // try to mute the user
                    try {
                        // Unmute the user
                        unmute(mutesRepo, member, serverDb.mutedRole);
                        // Log the unmute
                        logUnmute(
                            serversRepo,
                            member,
                            member.guild.members.cache.get(this.client.user.id)
                        );

                        logger.debug(
                            `Unmuting user ${member.user.tag} (${member.id}).`
                        );
                    } catch (err) {
                        logger.error(
                            'Error unmuting user in unmute loop. Reason: ',
                            err
                        );
                    }
                });
        }, 30000);
    }
}

import { Listener } from 'discord-akairo';
import { Mutes } from '../../models/mutes';
import { Servers } from '../../models/server';

export default class ReadyListener extends Listener {
    public constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
            category: 'client',
        });
    }

    public async exec() {
        // Log bot is online :)
        console.log(`${this.client.user.tag} is now online.`);

        const mutesRepo = this.client.db.getRepository(Mutes);
        const serversRepo = this.client.db.getRepository(Servers);

        // Update servers/members every 5 minutes.
        this.client.user.setActivity(
            `${this.client.guilds.cache.size} servers | ${this.client.users.cache.size} members`,
            { type: 'WATCHING' }
        );

        setInterval(() => {
            this.client.user.setActivity(
                `${this.client.guilds.cache.size} servers | ${this.client.users.cache.size} members`,
                { type: 'WATCHING' }
            );
        }, 3e5);

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

                    // Remove the mute
                    // TODO: Replace this with 'unmute' function that we will create
                    await member.roles.remove(serverDb.mutedRole, 'Unmuted');
                });
        }, 30000);
    }
}

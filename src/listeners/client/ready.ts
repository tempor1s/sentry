import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
    public constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
            category: 'client',
        });
    }

    public async exec() {
        console.log(`${this.client.user.tag} is now online.`);

        // Update servers/members every 5 minutes.
        setInterval(() => {
            this.client.user.setActivity(
                `${this.client.guilds.cache.size} servers | ${this.client.users.cache.size} members`,
                { type: 'WATCHING' }
            );
        }, 300000);
    }
}

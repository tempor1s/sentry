import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';
import { Servers } from '../../models/server';
import { Repository } from 'typeorm';
import { defaultPrefix } from '../../config';
import { createMuteOrUpdate } from '../../structures/mutemanager';

export default class BotJoinListener extends Listener {
    public constructor() {
        super('botJoin', {
            emitter: 'client',
            event: 'guildCreate',
        });
    }

    public async exec(guild: Guild) {
        // TODO: Send message to 'main' channel when the bot joins.
        const serversRepo: Repository<Servers> = this.client.db.getRepository(
            Servers
        );

        // Created muted role on join or take over the one that already exists.
        await createMuteOrUpdate(serversRepo, guild);

        // Create a new DB entry when the bot joins a server.
        await serversRepo.insert({ server: guild.id, prefix: defaultPrefix });
    }
}

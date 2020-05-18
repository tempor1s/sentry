import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';
import { Servers } from '../../models/server';
import { Repository } from 'typeorm';
import { defaultPrefix } from '../../config';

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

        await serversRepo.insert({ id: guild.id, prefix: defaultPrefix });
    }
}

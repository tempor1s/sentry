import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';
import { logImageUpload } from '../../../structures/logmanager';

export default class LogImageUploadListener extends Listener {
    public constructor() {
        super('logImageUpload', {
            emitter: 'client',
            event: 'message',
            category: 'client',
        });
    }

    public async exec(msg: Message) {
        if (msg.author.bot || msg.attachments.size < 1) {
            return;
        }

        logger.debug(`Image uploaded in ${msg.guild.name} (${msg.guild.id})`);

        let serversRepo = this.client.db.getRepository(Servers);
        await logImageUpload(serversRepo, msg);
    }
}

import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';
import { logMsgEdit } from '../../../structures/logManager';

export default class LogMessageEditListener extends Listener {
    public constructor() {
        super('logMsgEdit', {
            emitter: 'client',
            event: 'messageUpdate',
            category: 'client',
        });
    }

    public async exec(oldMessage: Message, newMessage: Message) {
        logger.debug(
            `Message edited in ${newMessage.guild.name} (${newMessage.guild.id})`
        );

        let serversRepo = this.client.db.getRepository(Servers);
        logMsgEdit(serversRepo, oldMessage, newMessage);
    }
}

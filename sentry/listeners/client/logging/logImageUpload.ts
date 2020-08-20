import { Listener } from 'discord-akairo';
import { Message, DMChannel } from 'discord.js';
import logger from '../../../utils/logger';
import { logImageUpload } from '../../../services/serverlogs';

export default class LogImageUploadListener extends Listener {
  public constructor() {
    super('logImageUpload', {
      emitter: 'client',
      event: 'message',
      category: 'client',
    });
  }

  public async exec(msg: Message) {
    if (
      msg.author.bot ||
      msg.attachments.size < 1 ||
      msg.channel instanceof DMChannel
    ) {
      return;
    }

    logger.debug(`Image uploaded in ${msg.guild!.name} (${msg.guild!.id})`);

    logImageUpload(msg);
  }
}

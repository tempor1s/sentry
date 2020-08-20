import { Command, Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import logger from '../../utils/logger';
import { logCommandExecute } from '../../services/serverlogs';

export default class LogCommandExecuteListener extends Listener {
  public constructor() {
    super('logCommandExecute', {
      emitter: 'commandHandler',
      event: 'commandStarted',
      category: 'commandHandler',
    });
  }

  public async exec(msg: Message, _command: Command, _args: any) {
    logCommandExecute(msg);

    logger.debug(
      `Command: '${msg.content}' -- Executor: '${msg.member?.user.tag} (${msg.member?.id})'`
    );
  }
}

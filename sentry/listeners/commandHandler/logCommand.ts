import { Command, Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import logger from '../../utils/logger';
import { logCommandExecute } from '../../structures/logManager';
import { Servers } from '../../models/server';

export default class LogCommandExecuteListener extends Listener {
  public constructor() {
    super('logCommandExecute', {
      emitter: 'commandHandler',
      event: 'commandStarted',
      category: 'commandHandler',
    });
  }

  public async exec(msg: Message, _command: Command, _args: any) {
    let serverRepo = this.client.db.getRepository(Servers);

    logCommandExecute(serverRepo, msg);

    logger.debug(
      `Command: '${msg.content}' -- Executor: '${msg.member?.user.tag} (${msg.member?.id})'`
    );
  }
}

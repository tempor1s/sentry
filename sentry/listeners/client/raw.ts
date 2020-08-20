import { Listener } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import {
  logUncachedMsgEdit,
  logUncachedMsgDelete,
} from '../../services/serverlogs';

export default class RawListener extends Listener {
  public constructor() {
    super('raw', {
      emitter: 'client',
      event: 'raw',
      category: 'client',
    });
  }

  public async exec(packet: any) {
    if (!['MESSAGE_UPDATE', 'MESSAGE_DELETE'].includes(packet.t)) return;

    // check to make sure the message is not in the cahe already - ignore if it is
    const channel = this.client.channels.cache.get(
      packet.d.channel_id
    ) as TextChannel;
    if (channel.messages.cache.get(packet.d.id)) return;

    switch (packet.t) {
      case 'MESSAGE_UPDATE':
        logUncachedMsgEdit(this.client, packet.d);
        break;
      case 'MESSAGE_DELETE':
        logUncachedMsgDelete(this.client, packet.d);
        break;
    }
  }
}

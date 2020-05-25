import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';
import ms from 'ms';

export default class MuteDurationConfigCommand extends Command {
  public constructor() {
    super('config-muteduration', {
      description: {
        content: 'Update the duration of the mute in the server.',
        usage: 'muteduration [muteduration]',
        examples: ['', '30s', '30m', '2h', '1 hour', '30 minutes', '3 days'],
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      args: [
        {
          id: 'duration',
          type: (_: Message, str: string) => {
            if (str) {
              return Number(ms(str));
            }
            return 0;
          },
        },
      ],
    });
  }

  public async exec(msg: Message, { duration }: { duration: number }) {
    let serverRepo = this.client.db.getRepository(Servers);
    let server = await serverRepo.findOne({
      where: { server: msg.guild.id },
    });

    if (duration === 0) {
      return msg.util?.send(
        `The current mute duration is ${ms(server.muteDuration)}`
      );
    }

    // update the mute duration
    try {
      await serverRepo.update(
        { server: msg.guild.id },
        { muteDuration: duration }
      );

      logger.debug(
        `Updating muted duration in ${msg.guild.name} (${msg.guild.id}) to ${ms(
          duration
        )}`
      );
    } catch (err) {
      logger.error(
        `Error updating mute duration in ${msg.guild.name} (${msg.guild.id}). Error: `,
        err
      );

      return msg.util?.send('Error when updating mute duration.');
    }

    return msg.util?.send(`The mute role has been set to ${ms(duration)}`);
  }
}

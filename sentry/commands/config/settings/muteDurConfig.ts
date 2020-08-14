import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../../utils/logger';
import ms from 'ms';
import { getServerById, updateServerById } from '../../../services/server';

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
    const server = await getServerById(msg.guild!.id);

    if (duration === 0) {
      return msg.util?.send(
        `Current Default Mute Duration ${ms(server!.muteDuration)}`
      );
    }

    // update the mute duration
    try {
      const updated = await updateServerById(msg.guild!.id, {
        muteDuration: duration,
      });

      if (updated) {
        logger.debug(
          `Updating muted duration in ${msg.guild?.name} (${
            msg.guild?.id
          }) to ${ms(duration)}`
        );
      } else {
        logger.error(
          `Error updating mute duration in ${msg.guild?.name} (${msg.guild?.id}).`
        );

        return msg.util?.send('Error when updating mute duration.');
      }
    } catch (err) {
      logger.error(
        `Error updating mute duration in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send('Error when updating mute duration.');
    }

    return msg.util?.send(`Updated Mute Duration: ${ms(duration)}`);
  }
}

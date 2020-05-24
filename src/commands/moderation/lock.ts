import ms from 'ms';
import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { lockChannel } from '../../structures/lockManager';
import { Repository } from 'typeorm';
import { ChannelLocks } from '../../models/channelLocks';

export default class LockCommand extends Command {
    public constructor() {
        super('lock', {
            aliases: ['lock', 'lockdown'],
            description: {
                content: 'Stop the sending of all messages in the channel.',
                usage: 'lock <duration>',
                examples: [
                    'lock',
                    'lock #general',
                    'lock #general 2h',
                    'lock general 10m',
                ],
            },
            category: 'moderation',
            channel: 'guild',
            userPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_CHANNELS,
            ],
            clientPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_CHANNELS,
            ],
            args: [
                {
                    id: 'channel',
                    type: 'channel',
                    default: (msg: Message) => msg.channel,
                },
                {
                    id: 'duration',
                    type: (_: Message, str: string) => {
                        if (str) {
                            return Number(ms(str));
                        }
                        return 0;
                    },
                    default: (_: Message) => 0,
                },
            ],
        });
    }

    public async exec(
        msg: Message,
        { channel, duration }: { channel: TextChannel; duration: number }
    ) {
        // get the ChannelLocks repo
        const channelLocksRepo = this.client.db.getRepository(ChannelLocks);
        // try to lock the channel
        let locked = await lockChannel(channelLocksRepo, channel, duration);

        if (!locked)
            return msg.util?.send('Channel is already locked or lock failed.');

        if (msg.channel.id !== channel.id)
            return msg.util?.send('Channel locked! :)');
    }
}

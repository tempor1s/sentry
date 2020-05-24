import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { AutoPurges } from '../../../models/autopurge';

export default class AutoPurgeStopCommand extends Command {
    public constructor() {
        super('autopurge-stop', {
            category: 'moderation',
            clientPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_CHANNELS,
            ],
            userPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_CHANNELS,
            ],
            args: [
                {
                    id: 'channel',
                    type: 'channel',
                    default: (msg: Message) => msg.channel,
                },
            ],
        });
    }

    // TODO: Refactor into other file
    // TODO: Error handling :)
    public async exec(msg: Message, { channel }: { channel: TextChannel }) {
        // no channel specified
        let autoPurgeRepo = this.client.db.getRepository(AutoPurges);

        let existingPurge = await autoPurgeRepo.findOne({
            where: { server: msg.guild.id, channel: channel.id },
        });

        // TODO: Maybe allow multiple purges per channel?
        // purge already exists on the channel
        if (!existingPurge) {
            return msg.util?.send(
                'There is no auto purge enabled for this channel.'
            );
        }

        // remove the auto purge from the channel
        await autoPurgeRepo.delete({
            server: msg.guild.id,
            channel: channel.id,
        });

        return msg.util?.send(`Removed auto purge from ${channel}.`);
    }
}

import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { AutoPurges } from '../../../models/autopurge';

export default class AutoPurgeStopAllCommand extends Command {
    public constructor() {
        super('autopurge-stopall', {
            category: 'moderation',
            clientPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_CHANNELS,
            ],
            userPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_CHANNELS,
            ],
        });
    }

    // TODO: Refactor into other file
    // TODO: Error handling :)
    public async exec(msg: Message) {
        let autoPurgeRepo = this.client.db.getRepository(AutoPurges);

        // remove all purges for the given server
        let removedPurges = await autoPurgeRepo.delete({
            server: msg.guild.id,
        });

        return msg.util?.send(
            removedPurges.affected
                ? `Stopped \`${removedPurges.affected}\` auto purge(s) from the server.`
                : 'There are no channel auto-purges in this server.'
        );
    }
}


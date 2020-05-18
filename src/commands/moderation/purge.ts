import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';

export default class PurgeCommand extends Command {
    public constructor() {
        // TODO: Allow the ability to purge only a user.
        super('purge', {
            aliases: ['purge', 'clear', 'clean'],
            description: {
                content: 'Purge messages from a channel',
                usage: 'purge <amount>',
                examples: ['purge 10', 'purge 100'],
            },
            category: 'moderation',
            channel: 'guild',
            clientPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],
            args: [
                {
                    id: 'amount',
                    type: 'number',
                    match: 'content',
                },
            ],
        });
    }

    public async exec(msg: Message, { amount }: { amount: number }) {
        if (!amount) {
            return msg.util?.send(
                'Please specify an amount of messages to purge.'
            );
        }

        msg.channel.bulkDelete(amount + 1);
        return msg.util?.send(`Deleted \`${amount}\` messages.`);
    }
}

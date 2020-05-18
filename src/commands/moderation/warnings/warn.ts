import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES } from '../../../utils/constants';

export default class WarnCommand extends Command {
    public constructor() {
        super('warn', {
            aliases: ['warn'],
            category: 'moderation',
            description: {
                content: MESSAGES.COMMANDS.MODERATION.WARN.DESCRIPTION,
                usage: 'warn <method> <...arguments>',
                examples: [
                    'add temporis bad boy!',
                    'remove temporis 3',
                    'list temporis',
                    'clear temporis',
                ],
            },
            channel: 'guild',
            clientPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],
        });
    }

    public *args() {
        const method = yield {
            type: [
                ['warn-add', 'add'],
                ['warn-remove', 'remove'],
                ['warn-list', 'list'],
                ['warn-clear', 'clear'],
            ],
            otherwise: (msg: Message) => {
                const prefix = (this.handler.prefix as PrefixSupplier)(msg);
                return MESSAGES.COMMANDS.MODERATION.WARN.REPLY(prefix);
            },
        };

        return Flag.continue(method);
    }
}

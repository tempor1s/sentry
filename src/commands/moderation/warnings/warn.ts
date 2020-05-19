import { stripIndents } from 'common-tags';
import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';

export default class WarnCommand extends Command {
    public constructor() {
        super('warn', {
            aliases: ['warn'],
            category: 'moderation',
            clientPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_ROLES,
            ],
            userPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_ROLES,
            ],
            description: {
                content: stripIndents`Manage warnings.

                   Available methods:
                     • add \`<member>\` \`[reason]\`
                     • remove \`<member>\` \`<id>\`
                     • list \`<member>\`
                     • clear \`<member>\`
                `,
                usage: 'warn <method> <...arguments>',
                examples: [
                    'add temporis bad boy!',
                    'remove temporis 3',
                    'list temporis',
                    'clear temporis',
                ],
            },
            channel: 'guild',
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
            otherwise: (_: Message) => {
                return `Check help for more information.`;
            },
        };

        return Flag.continue(method);
    }
}

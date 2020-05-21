import { stripIndents } from 'common-tags';
import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';

export default class RolesCommand extends Command {
    public constructor() {
        super('roles', {
            aliases: ['roles'],
            category: 'moderation',
            clientPermissions: [Permissions.FLAGS.MANAGE_ROLES],
            userPermissions: [Permissions.FLAGS.MANAGE_ROLES],
            description: {
                content: stripIndents`Manage roles.

                   Available methods:
                     • add \`<user>\` \`<role>\`
                     • remove \`<user>\` \`<role>\`
                     • addall \`<role>\`
                     • removeall \`<role>\`
                     • clear \`<user>\`
                `,
                usage: 'warn <method> <...arguments>',
                examples: [
                    'add @temporis#6402 Member',
                    'remove temporis Moderator',
                    'addall Member',
                    'removeall Member',
                    'clear',
                ],
            },
            channel: 'guild',
        });
    }

    public *args() {
        const method = yield {
            type: [
                ['roles-add', 'add'],
                ['roles-remove', 'remove'],
                ['roles-addall', 'addall'],
                ['roles-removeall', 'removeall'],
                ['roles-clear', 'clear'],
            ],
            otherwise: async (msg: Message) => {
                let prefix = await (this.handler.prefix as PrefixSupplier)(msg);
                return `Check \`${prefix}help roles\` for more information.`;
            },
        };

        return Flag.continue(method);
    }
}

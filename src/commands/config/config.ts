import { stripIndents } from 'common-tags';
import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';

export default class ConfigCommand extends Command {
    public constructor() {
        super('config', {
            aliases: ['config'],
            category: 'config',
            clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
            userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
            description: {
                content: stripIndents`Manage the servers config.

                   Available methods:
                     • show 
                     • update \`<field>\` \`<value>\`
                     • reset \`[field]\`
                `,
                usage: 'config <method> <...arguments>',
                examples: [
                    'show',
                    'update prefix >>',
                    'update muterole @Mute',
                    'reset',
                    'reset prefix',
                ],
            },
            channel: 'guild',
        });
    }

    public *args() {
        const method = yield {
            type: [
                ['config-update', 'update'],
                ['config-show', 'show'],
                ['config-reset', 'reset'],
            ],
            otherwise: async (msg: Message) => {
                let prefix = await (this.handler.prefix as PrefixSupplier)(msg);
                return `Check \`${prefix}help config\` for more information.`;
            },
        };

        return Flag.continue(method);
    }
}

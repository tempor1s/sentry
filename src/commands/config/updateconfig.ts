import { stripIndents } from 'common-tags';
import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';

export default class UpdateConfigCommand extends Command {
    public constructor() {
        super('config-update', {
            category: 'config',
            clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
            userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
            description: {
                content: `Manage the servers config.`,
                usage: '<field> <new value>',
                examples: [
                    'prefix ',
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
                // TODO: Rework names
                ['field-prefix', 'prefix'],
                ['field-muterole', 'muterole'],
                ['field-muteduration', 'muteduration'],
                ['field-commandlogtoggle', 'commandlogtoggle'],
                ['field-commandlog', 'commandlog'],
                ['field-modlogtoggle', 'modlogtoggle'],
                ['field-modlog', 'modlog'],
                ['field-logdeletes', 'logdeletes'],
                ['field-logedits', 'logedits'],
                ['field-logimages', 'logedits'],
                ['field-msglog', 'msglog'],
                ['field-autoroletoggle', 'autoroletoggle'],
                ['field-autorole', 'autorole'],
                ['field-joinmsg', 'joinmsg'],
                ['field-leavemsg', 'leavemsg'],
                ['field-joinleavelog', 'joinleavelog'],
            ],
            otherwise: async (msg: Message) => {
                let prefix = await (this.handler.prefix as PrefixSupplier)(msg);
                return `Invalid field. Check \`${prefix}help config\` for more information.`;
            },
        };

        return Flag.continue(method);
    }
}

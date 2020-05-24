import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { ConfigFields } from '../../utils/config';

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
            type: ConfigFields,
            otherwise: async (msg: Message) => {
                let prefix = await (this.handler.prefix as PrefixSupplier)(msg);
                return `Invalid field. Check \`${prefix}help config\` for more information.`;
            },
        };

        return Flag.continue(method);
    }
}

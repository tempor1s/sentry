import { stripIndents } from 'common-tags';
import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';

// TODO: Premium Only
export default class AutoPurgeCommand extends Command {
    public constructor() {
        super('autopurge', {
            aliases: ['autopurge'],
            category: 'moderation',
            clientPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_CHANNELS,
            ],
            userPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_CHANNELS,
            ],
            description: {
                content: stripIndents`Manage channels that are auto purged in the server.

                   Available methods:
                     • start \`<channel>\` \`<duration>\`
                     • stop \`<channel>\`
                     • show
                     • stopall
                `,
                usage: 'autopurge <method> <...arguments>',
                examples: ['start #spam 3d', 'stop #spam', 'show', 'stopall'],
            },
            channel: 'guild',
        });
    }

    public *args() {
        const method = yield {
            type: [
                ['autopurge-start', 'start'],
                ['autopurge-stop', 'stop'],
                ['autopurge-show', 'show'],
                ['autopurge-stopall', 'stopall'],
            ],
            otherwise: async (msg: Message) => {
                let prefix = await (this.handler.prefix as PrefixSupplier)(msg);
                return `Check \`${prefix}help autopurge\` for more information.`;
            },
        };

        return Flag.continue(method);
    }
}

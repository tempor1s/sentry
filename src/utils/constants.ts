import { stripIndents } from 'common-tags';

export const MESSAGES = {
    COMMANDS: {
        MISC: {
            HELP: {
                SUB_DESCRIPTION: stripIndents`Required: \`<>\` | Optional: \`[]\``,
                DESCRIPTION:
                    'Displays a list of available commands, or detailed information for a specified command.',
                REPLY: (
                    prefix: string | string[] | Promise<string | string[]>
                ) => stripIndents`A list of available commands.
					For additional info on a command, type \`${prefix}help <command>\`
                    Required: \`<>\` | Optional: \`[]\`
				`,
            },
            PREFIX: {
                DESCRIPTION: 'View or update the prefix of the bot.',
            },
        },
        MODERATION: {
            WARN: {
                DESCRIPTION: stripIndents`Manage warnings.

                   Available methods:
                     • add \`<member>\` \`[reason]\`
                     • remove \`<member>\` \`<id>\`
                     • list \`<member>\`
                     • clear \`<member>\`
                `,
                REPLY: (
                    prefix: string | string[] | Promise<string | string[]>
                ) => stripIndents`
                        Check \`${prefix}help warnings\` for more information.
                        `,
            },
        },
        INFO: {
            SERVER: {
                DESCRIPTION: 'Get information about the current server.',
            },
            USER: {
                DESCRIPTION: 'Get information about a user in a server.',
            },
            ROLE: {
                DESCRIPTION: 'Get information about a role in a server.',
            },
            CHANNEL: {
                DESCRIPTION: 'Get information about a channel in a server.',
            },
            EMOJI: {
                DESCRIPTION: 'Get information about an emoji in a server.',
            },
        },
    },
};

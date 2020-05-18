import { stripIndents } from 'common-tags';

export const MESSAGES = {
    COMMANDS: {
        MISC: {
            HELP: {
                DESCRIPTION:
                    'Displays a list of available commands, or detailed information for a specified command.',
                REPLY: (
                    prefix: string | string[] | Promise<string | string[]>
                ) => stripIndents`A list of available commands.
					For additional info on a command, type \`${prefix}help <command>\`
				`,
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

                   Required: \`<>\` | Optional: \`[]\`
                `,
                REPLY: (
                    prefix: string | string[] | Promise<string | string[]>
                ) => stripIndents`
                        When you beg me so much I just can't not help you~
                        Check \`${prefix}help cases\` for more information.
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

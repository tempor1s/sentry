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
        },
    },
};

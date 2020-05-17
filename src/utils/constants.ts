import { stripIndents } from 'common-tags';

export const MESSAGES = {
    // TODO: Move this into commands helper msg
    HELP: {
        DESCRIPTION:
            'Displays a list of available commands, or detailed information for a specified command.',
        REPLY: (
            prefix: string | string[] | Promise<string | string[]>
        ) => stripIndents`A list of available commands.
					For additional info on a command, type \`${prefix}help <command>\`
				`,
    },
    COMMANDS: {
        INFO: {
            SERVER: {
                DESCRIPTION: 'Get information about the current server.',
            },
        },
    },
};

import { Command } from 'discord-akairo';
import { defaultPrefix } from '../../config';
import { Message, Permissions } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';
import { MESSAGES } from '../../utils/constants';

export default class Help extends Command {
    public constructor() {
        super('help', {
            aliases: ['help'],
            description: {
                content: 'Get help and information about the bot.',
                usage: ['help'],
                examples: ['help ping', 'help warn'],
            },
            category: 'misc',
            args: [
                {
                    id: 'command',
                    type: 'commandAlias',
                },
            ],
        });
    }

    public async exec(msg: Message, { command }: { command: Command }) {
        // TODO: Swap this to use prefix provider
        const prefix = defaultPrefix;

        if (!command) {
            const embed = getDefaultEmbed().addField(
                '❯ Commands',
                MESSAGES.HELP.REPLY(prefix)
            );

            for (const category of this.handler.categories.values()) {
                embed.addField(
                    `❯ ${category.id.replace(/(\b\w)/gi, (lc) =>
                        lc.toUpperCase()
                    )}`,
                    `${category
                        .filter((cmd) => cmd.aliases.length > 0)
                        .map((cmd) => `\`${cmd.aliases[0]}\``)
                        .join(' ')}`
                );
            }

            return msg.util?.send(embed);
        }

        const embed = getDefaultEmbed()
            .setTitle(`\`${command.description.usage}\``)
            .addField('❯ Description', command.description.content || '\u200b');

        if (command.aliases.length > 1)
            embed.addField(
                '❯ Aliases',
                `\`${command.aliases.join('` `')}\``,
                true
            );
        if (command.description.examples?.length)
            embed.addField(
                '❯ Examples',
                `\`${command.aliases[0]} ${command.description.examples.join(
                    `\`\n\`${command.aliases[0]} `
                )}\``,
                true
            );

        return msg.util?.send(embed);
    }
}

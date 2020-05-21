import { stripIndents } from 'common-tags';
import { Command, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';

export default class Help extends Command {
    public constructor() {
        super('help', {
            aliases: ['help'],
            description: {
                content:
                    'Displays a list of available commands, or detailed information for a specified command.',
                usage: ['help'],
                examples: ['help ping', 'help warn'],
            },
            category: 'misc',
            channel: 'guild',
            args: [
                {
                    id: 'command',
                    type: 'commandAlias',
                },
            ],
        });
    }

    public async exec(msg: Message, { command }: { command: Command }) {
        const prefix = await (this.handler.prefix as PrefixSupplier)(msg);

        if (!command) {
            const embed = getDefaultEmbed().addField(
                '❯ Commands',
                stripIndents`A list of available commands.
					For additional info on a command, type \`${prefix}help <command>\`
                    Required: \`<>\` | Optional: \`[]\`
				`
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
            .setTitle(`\`${prefix}${command.description.usage}\``)
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
                `\`${prefix}${
                    command.aliases[0]
                } ${command.description.examples.join(
                    `\`\n\`${prefix}${command.aliases[0]} `
                )}\``,
                true
            );

        embed.addField('❯ Legend', `Required: \`<>\` | Optional: \`[]\``);

        return msg.util?.send(embed);
    }
}

import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';
import { MESSAGES } from '../../utils/constants';

export default class Help extends Command {
    public constructor() {
        super('help', {
            aliases: ['help'],
            description: {
                content: MESSAGES.COMMANDS.MISC.HELP.DESCRIPTION,
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
        const prefix = await (this.handler.prefix as PrefixSupplier)(msg);

        if (!command) {
            const embed = getDefaultEmbed().addField(
                '❯ Commands',
                MESSAGES.COMMANDS.MISC.HELP.REPLY(prefix)
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
                `\`${command.aliases[0]} ${command.description.examples.join(
                    `\`\n\`${command.aliases[0]} `
                )}\``,
                true
            );

        embed.addField('❯ Legend', MESSAGES.COMMANDS.MISC.HELP.SUB_DESCRIPTION);

        return msg.util?.send(embed);
    }
}

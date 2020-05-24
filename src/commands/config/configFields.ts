import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { ConfigFields, ConfigDescription } from '../../utils/config';
import { getDefaultEmbed } from '../../utils/message';
import { stripIndents } from 'common-tags';

export default class ConfigFieldsCommand extends Command {
    public constructor() {
        super('config-fields', {
            category: 'config',
            clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
            userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
        });
    }

    public async exec(msg: Message) {
        let embed = getDefaultEmbed()
            .setTitle('Configuration Fields')
            .setDescription(
                ConfigFields.map(
                    (field) =>
                        stripIndents`❯ \`${field[1]}\`\n${
                            ConfigDescription[field[1]]
                        }`
                ).join('\n')
            );

        return msg.util?.send(embed);
    }
}

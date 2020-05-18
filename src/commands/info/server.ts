import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';
import * as moment from 'moment';
import 'moment-duration-format';
import { MESSAGES } from '../../utils/constants';

interface VerificationLevels {
    [key: string]: string;
}

const VERIFICATION_LEVELS: VerificationLevels = {
    NONE: 'None',
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: '(╯°□°）╯︵ ┻━┻',
    VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻',
};

export default class ServerInfoCommand extends Command {
    public constructor() {
        super('server', {
            aliases: ['server', 'serverinfo', 'guildinfo', 'guild'],
            description: {
                content: MESSAGES.COMMANDS.INFO.SERVER.DESCRIPTION,
                usage: 'server',
            },
            category: 'info',
            channel: 'guild',
            clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
        });
    }

    public async exec(msg: Message) {
        // TODO: Pastebin or dump of all users? :)
        const guild = msg.guild!;
        const embed = getDefaultEmbed()
            .setTitle(guild.name)
            .addField('ID', guild.id, false)
            .addField(
                'Owner',
                `${guild.owner!.user} (ID: ${guild.ownerID})`,
                false
            )
            .addField(
                'Created at (UTC)',
                moment.utc(guild.createdAt).format('MM/DD/YYYY hh:mm'),
                true
            )
            .addField('Members', guild.memberCount, true)
            .addField(
                'Text Channels',
                guild.channels.cache.filter((ch) => ch.type == 'text').size,
                true
            )
            .addField(
                'Voice Channels',
                guild.channels.cache.filter((ch) => ch.type == 'voice').size,
                true
            )
            .addField(
                'AFK Channel',
                guild.afkChannelID
                    ? `<#${guild.afkChannelID}}> after ${
                          guild.afkTimeout / 60
                      }min`
                    : 'None',
                true
            )
            .addField('Emojis', guild.emojis.cache.size, true)
            .addField('Roles', guild.roles.cache.size, true)
            .addField('Bans', (await guild.fetchBans()).size, true)
            .addField('Region', guild.region, true)
            .addField(
                'Verification Level',
                VERIFICATION_LEVELS[guild.verificationLevel],
                true
            )
            .setThumbnail(guild.iconURL() ?? '');

        return msg.util?.send(embed);
    }
}

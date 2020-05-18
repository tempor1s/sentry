import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { MESSAGES } from '../../utils/constants';
import { getDefaultEmbed } from '../../utils/message';

export default class ChannelInfoCommand extends Command {
    public constructor() {
        super('channel', {
            aliases: ['channel', 'channelinfo', 'channel-info'],
            description: {
                content: MESSAGES.COMMANDS.INFO.CHANNEL.DESCRIPTION,
                usage: 'channel <channel>',
                examples: ['#general', 'general', '688166040513151041'],
            },
            category: 'info',
            channel: 'guild',
            clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
            args: [
                {
                    id: 'channel',
                    match: 'content',
                    type: 'channel',
                    default: (msg: Message) => msg.channel,
                },
            ],
        });
    }

    public async exec(msg: Message, { channel }: { channel: TextChannel }) {
        const embed = getDefaultEmbed()
            .setTitle(`#${channel.name}`)
            .addField('ID', channel.id, false)
            .addField('Type', channel.type, true)
            .addField('Topic', channel.topic || 'None', true)
            .addField('NSFW', Boolean(channel.nsfw) ? 'Yes' : 'No', true)
            .addField(
                'Created at (UTC)',
                moment.utc(channel.createdAt).format('MM/DD/YYYY hh:mm'),
                true
            )
            .setThumbnail(msg.guild!.iconURL() ?? '');

        msg.util?.send(embed);
    }
}

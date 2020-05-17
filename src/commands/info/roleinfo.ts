import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { MESSAGES } from '../../utils/constants';
import { getDefaultEmbed } from '../../utils/message';

interface PermissionsIndex {
    [key: string]: string;
}

const PERMISSIONS: PermissionsIndex = {
    ADMINISTRATOR: 'Administrator',
    VIEW_AUDIT_LOG: 'View audit log',
    MANAGE_GUILD: 'Manage server',
    MANAGE_ROLES: 'Manage roles',
    MANAGE_CHANNELS: 'Manage channels',
    KICK_MEMBERS: 'Kick members',
    BAN_MEMBERS: 'Ban members',
    CREATE_INSTANT_INVITE: 'Create instant invite',
    CHANGE_NICKNAME: 'Change nickname',
    MANAGE_NICKNAMES: 'Manage nicknames',
    MANAGE_EMOJIS: 'Manage emojis',
    MANAGE_WEBHOOKS: 'Manage webhooks',
    VIEW_CHANNEL: 'Read text channels and see voice channels',
    SEND_MESSAGES: 'Send messages',
    SEND_TTS_MESSAGES: 'Send TTS messages',
    MANAGE_MESSAGES: 'Manage messages',
    EMBED_LINKS: 'Embed links',
    ATTACH_FILES: 'Attach files',
    READ_MESSAGE_HISTORY: 'Read message history',
    MENTION_EVERYONE: 'Mention everyone',
    USE_EXTERNAL_EMOJIS: 'Use external emojis',
    ADD_REACTIONS: 'Add reactions',
    CONNECT: 'Connect',
    SPEAK: 'Speak',
    MUTE_MEMBERS: 'Mute members',
    DEAFEN_MEMBERS: 'Deafen members',
    MOVE_MEMBERS: 'Move members',
    USE_VAD: 'Use voice ativity',
};

export default class RoleInfoCommand extends Command {
    public constructor() {
        super('roleinfo', {
            aliases: ['roleinfo', 'role', 'role-info'],
            description: {
                content: MESSAGES.COMMANDS.INFO.ROLE.DESCRIPTION,
                usage: 'roleinfo [role]',
                examples: ['mod', '@mod', '536334100055719954'],
            },
            category: 'info',
            channel: 'guild',
            clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
            args: [
                {
                    id: 'role',
                    match: 'content',
                    default: (msg: Message) => msg.member?.roles.highest,
                },
            ],
        });
    }

    public async exec(msg: Message, { role }: { role: Role }) {
        const permissions = Object.keys(PERMISSIONS).filter(
            (permission) => role.permissions.serialize()[permission]
        );
        const embed = getDefaultEmbed()
            .setTitle(role.name)
            .addField('ID', role.id, false)
            .addField('Color', role.hexColor.toUpperCase(), true)
            .addField('Hoisted', role.hoist ? 'Yes' : 'No', true)
            .addField('Mentionable', role.mentionable ? 'Yes' : 'No', true)
            .addField(
                'Creation Date',
                moment.utc(role.createdAt).format('MM/DD/YYYY hh:mm:ss'),
                true
            )
            .addField(
                'Permissions',
                permissions
                    .map((permission) => `❯ ${PERMISSIONS[permission]}`)
                    .join('\n') || 'None',
                false
            )
            .setThumbnail(msg.guild!.iconURL() ?? '');

        return msg.util?.send(embed);
    }
}

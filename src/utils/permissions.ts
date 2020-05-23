import { Message, GuildMember, Role } from 'discord.js';

interface PermissionsIndex {
    [key: string]: string;
}

export const PERMISSIONS: PermissionsIndex = {
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

// a check to make sure that the user does not have higher or equal permissions to yourself
// returns true if higher or equal permissions
export async function checkHigherOrEqualPermissions(
    modMsg: Message,
    other: GuildMember
): Promise<boolean> {
    if (
        other.roles.highest.position >= modMsg.member.roles.highest.position &&
        modMsg.author.id !== modMsg.guild.ownerID
    ) {
        return true;
    }

    return false;
}

export async function checkHigherRole(
    msg: Message,
    role: Role
): Promise<boolean> {
    if (
        msg.member.roles.highest.position <= role.position &&
        msg.author.id !== msg.guild.ownerID
    ) {
        return true;
    }

    return false;
}

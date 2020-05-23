import { Command, Listener } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import logger from '../../utils/logger';

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

export default class MissingPermissionsListern extends Listener {
    public constructor() {
        super('missingPermissions', {
            emitter: 'commandHandler',
            event: 'missingPermissions',
            category: 'commandHandler',
        });
    }

    public async exec(
        msg: Message,
        command: Command,
        type: string,
        missing: any
    ) {
        if (type === 'client') {
            logger.debug(
                `Missing client permissions for command ${command.aliases[0]}`
            );

            return msg.util?.send(
                `Missing Bot Permissions. Please give the bot \`Administrator\` permission for it to function correctly.`
            );
        } else {
            logger.debug(
                `Missing command user permissions for command ${
                    command.aliases[0]
                }. Permssions: ${new Permissions(missing).toArray()}`
            );

            return msg.util?.send(
                `You are unable to use that command. Missing Permissions:\n${new Permissions(
                    missing
                )
                    .toArray(true)
                    .map((permission) => `❯ **${PERMISSIONS[permission]}**`)
                    .join('\n')}`
            );
        }
    }
}

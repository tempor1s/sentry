import { Repository } from 'typeorm';
import { Servers } from '../models/server';
import { Message, TextChannel } from 'discord.js';
import { getDefaultEmbed } from '../utils/message';
import logger from '../utils/logger';

enum Action {
    MUTE = 'Mute',
    UNMUTE = 'Unmute',
    KICK = 'Kick',
    BAN = 'Ban',
    PURGE = 'Purge',
    NUKE = 'Nuke',
    SLOWMODE = 'Slowmode',
    LOCK = 'Channel Lock',
}

enum Executor {
    USER = 'User',
    BOT = 'Bot', // TODO: Antispam? lol
}

export async function logCommandExecute(
    repo: Repository<Servers>,
    msg: Message
) {
    let server = await repo.findOne({ where: { server: msg.member.guild.id } });

    let embed = getDefaultEmbed()
        .setTitle('Command Executed')
        .addField('Command', msg.content, false)
        .addField('Executor', msg.member.user, true)
        .setThumbnail(msg.member.user.displayAvatarURL());

    // send the message to the command log channel
    if (server.commandLogEnabled) {
        if (server.commandLog) {
            let channel = msg.guild.channels.cache.get(
                server.commandLog
            ) as TextChannel;
            channel.send(embed);

            logger.debug(
                `Command: '${msg.content}' -- Executor: '${msg.member.user.tag} (${msg.member.id})'`
            );
        } else {
            logger.debug(
                'Command not logged because there is no command log channel set.'
            );
        }
    } else {
        logger.debug('Command not logged because command log not enabled.');
    }
}

// export async function logPurge(repo: Repository<Servers>, reason: string) {}

// export async function logMute(
//     repo: Repository<Servers>,
//     member: GuildMember,
//     reason: string,
//     duration: string,
//     moderator: string
// );
//
// export async function logUnmute(
//     repo: Repository<Servers>,
//     member: GuildMember,
//     reason: string,
//     duration: string,
//     moderator: string
// );

// export async function logNuke(repo: Repository<Servers>, )
//

// ENABLE
// -- use log channel if it already exists
// -- create log channel if it does not exists? maybe prompt? don't let enable

// DISABLE
// -- just turn off and no longer log actions
// -- maybe give option to delete channel? idk

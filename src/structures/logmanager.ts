import { Repository } from 'typeorm';
import { Servers } from '../models/server';
import { Message, TextChannel, GuildMember } from 'discord.js';
import { getDefaultEmbed } from '../utils/message';
import logger from '../utils/logger';
import ms from 'ms';

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
    if (!server.commandLogEnabled && !server.modLog) {
        return;
    }

    let channel = msg.guild.channels.cache.get(
        server.commandLog
    ) as TextChannel;

    channel.send(embed);
}

export async function logMute(
    repo: Repository<Servers>,
    member: GuildMember,
    reason: string,
    duration: number,
    moderator: GuildMember
) {
    let server = await repo.findOne({ where: { server: member.guild.id } });

    // make sure mod log is enabled and a channel is set
    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle(`User Muted | ${member.user.tag}`)
        .addField('Reason', reason, false)
        .addField('Moderator', moderator.user, false)
        .addField('Duration', ms(duration), false)
        .setThumbnail(member.user.displayAvatarURL());

    let modLogChannel = member.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

// export async function logPurge(repo: Repository<Servers>, reason: string) {}

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

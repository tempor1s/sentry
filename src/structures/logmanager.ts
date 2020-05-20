import { Repository } from 'typeorm';
import { Servers } from '../models/server';
import { Message, TextChannel, GuildMember } from 'discord.js';
import { getDefaultEmbed } from '../utils/message';
import ms from 'ms';

export enum Executor {
    USER = 'User',
}

export async function logMsgDelete(
    repo: Repository<Servers>,
    msg: Message,
    executor: Executor
) {
    let server = await repo.findOne({ where: { server: msg.member.guild.id } });

    if (!server.messageLogDeletesEnabled && !server.messageLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Message Deleted')
        .addField('Content', msg.content, false)
        .addField('ID', msg.id, true)
        .addField('Channel', msg.channel, true)
        .addField('Executor', `${executor} - ${msg.member.user}`, true)
        .setThumbnail(msg.member.user.displayAvatarURL());

    let channel = msg.guild.channels.cache.get(
        server.messageLog
    ) as TextChannel;

    channel.send(embed);
}

export async function logCommandExecute(
    repo: Repository<Servers>,
    msg: Message
) {
    let server = await repo.findOne({ where: { server: msg.member.guild.id } });

    if (!server.commandLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Command Executed')
        .addField('Command', msg.content, false)
        .addField('Executor', msg.member.user, true)
        .setThumbnail(msg.member.user.displayAvatarURL());

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

export async function logUnmute(
    repo: Repository<Servers>,
    member: GuildMember,
    moderator: GuildMember
) {
    let server = await repo.findOne({ where: { server: member.guild.id } });

    // make sure mod log is enabled and a channel is set
    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle(`User Unmuted | ${member.user.tag}`)
        .addField('Moderator', moderator.user, false)
        .setThumbnail(member.user.displayAvatarURL());

    let modLogChannel = member.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

export async function logPurge(
    repo: Repository<Servers>,
    moderator: GuildMember,
    count: number
) {
    let server = await repo.findOne({ where: { server: moderator.guild.id } });

    // make sure mod log is enabled and a channel is set
    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle(`Messages Purged`)
        .addField('Moderator', moderator.user, true)
        .addField('Purged Count', count, true)
        .setThumbnail(moderator.user.displayAvatarURL());

    let modLogChannel = moderator.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

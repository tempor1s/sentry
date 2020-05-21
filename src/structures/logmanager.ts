import { Repository } from 'typeorm';
import { Servers } from '../models/server';
import { Message, TextChannel, GuildMember } from 'discord.js';
import { getDefaultEmbed } from '../utils/message';
import ms from 'ms';

export async function logMsgDelete(repo: Repository<Servers>, msg: Message) {
    let server = await repo.findOne({ where: { server: msg.member.guild.id } });

    if (
        !server.messageLogDeletesEnabled ||
        !server.messageLog ||
        msg.author.bot
    ) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Message Deleted')
        .addField('Content', msg.content, false)
        .addField('ID', msg.id, true)
        .addField('Channel', msg.channel, true)
        .addField('Executor', msg.member.user, true)
        .setThumbnail(msg.member.user.displayAvatarURL());

    let channel = msg.guild.channels.cache.get(
        server.messageLog
    ) as TextChannel;

    channel.send(embed);
}

export async function logMsgEdit(
    repo: Repository<Servers>,
    oldMsg: Message,
    newMsg: Message
) {
    let server = await repo.findOne({
        where: { server: newMsg.member.guild.id },
    });

    if (
        !server.messageLogEditsEnabled ||
        !server.messageLog ||
        newMsg.author.bot
    ) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Message Edited')
        .addField('Before', oldMsg.cleanContent, false)
        .addField('After', newMsg.cleanContent, false)
        .addField('ID', newMsg.id, true)
        .addField('Channel', newMsg.channel, true)
        .addField('Executor', newMsg.member.user, true)
        .setThumbnail(newMsg.member.user.displayAvatarURL());

    let channel = newMsg.guild.channels.cache.get(
        server.messageLog
    ) as TextChannel;

    channel.send(embed);
}

export async function logImageUpload(repo: Repository<Servers>, msg: Message) {
    let server = await repo.findOne({
        where: { server: msg.member.guild.id },
    });

    if (
        !server.messageLogImagesEnabled ||
        !server.messageLog ||
        msg.author.bot
    ) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Image Uploaded')
        .addField('ID', msg.id, true)
        .addField('Channel', msg.channel, true)
        .addField('User', msg.member.user, true);

    embed.attachFiles(
        Array.from(msg.attachments.values()).map((attachment) => attachment.url)
    );

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

    if (!server.commandLogEnabled || !server.modLog) {
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
    if (!server.modLogEnabled || !server.modLog) {
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
    if (!server.modLogEnabled || !server.modLog) {
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

export async function logKick(
    repo: Repository<Servers>,
    member: GuildMember,
    reason: string,
    moderator: GuildMember
) {
    let server = await repo.findOne({ where: { server: member.guild.id } });

    // make sure mod log is enabled and a channel is set
    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle(`User Kicked | ${member.user.tag}`)
        .addField('Reason', reason, false)
        .addField('Moderator', moderator.user, false)
        .setThumbnail(member.user.displayAvatarURL());

    let modLogChannel = member.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

import { Repository } from 'typeorm';
import { Servers } from '../models/server';
import {
    Message,
    TextChannel,
    GuildMember,
    Role,
    Collection,
    User,
} from 'discord.js';
import { getDefaultEmbed } from '../utils/message';
import ms from 'ms';
import { utc } from 'moment';
import 'moment-duration-format';

// TODO: Use raw events to log old message deletes
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
        .addField('Message', `[Context](${msg.url})`, true)
        .addField('ID', msg.id, true)
        .addField('Channel', msg.channel, true)
        .addField('Executor', msg.member.user, true)
        .setThumbnail(msg.member.user.displayAvatarURL());

    // add attachments
    let attachment = msg.attachments.first();
    if (attachment) embed.addField('Attachment(s)', attachment.url);

    let channel = msg.guild.channels.cache.get(
        server.messageLog
    ) as TextChannel;

    channel.send(embed);
}

// TODO: Use raw events to log old message edits
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
        .addField('Message', `[Context](${newMsg.url})`)
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
        .addField('Moderator', moderator.user, true)
        .addField('Duration', ms(duration), true)
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
    count: number,
    msgs: Collection<string, Message>
) {
    let server = await repo.findOne({ where: { server: moderator.guild.id } });

    // make sure mod log is enabled and a channel is set
    if (!server.modLogEnabled || !server.modLog) {
        return;
    }

    const output = msgs.reduce((out, msg) => {
        const attachment = msg.attachments.first();
        out += `[${utc(msg.createdTimestamp).format('MM/DD/YYYY hh:mm:ss')}] ${
            msg.author.tag
        } (${msg.author.id}): ${
            msg.cleanContent ? msg.cleanContent.replace(/\n/g, '\r\n') : ''
        }${attachment ? `\r\n${attachment.url}` : ''}\r\n`;
        return out;
    }, '');

    let embed = getDefaultEmbed()
        .setTitle(`Messages Purged`)
        .addField('Moderator', moderator.user, true)
        .addField(
            'Logs',
            'See attachment file for full logs (possibly about this embed)'
        )
        .addField('Purged Count', count, true)
        .setThumbnail(moderator.user.displayAvatarURL());

    embed.attachFiles([
        { attachment: Buffer.from(output, 'utf8'), name: 'logs.txt' },
    ]);

    let modLogChannel = moderator.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

// TODO: Log kick through event as well
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

// TODO: Log ban through event as well
export async function logBan(
    repo: Repository<Servers>,
    member: GuildMember,
    reason: string,
    moderator: GuildMember,
    duration: string = 'Indefinite'
) {
    let server = await repo.findOne({ where: { server: member.guild.id } });

    // make sure mod log is enabled and a channel is set
    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle(`User Banned | ${member.user.tag}`)
        .addField('Reason', reason, false)
        .addField('Moderator', moderator.user, true)
        .addField('Duration', duration, true)
        .setThumbnail(member.user.displayAvatarURL());

    let modLogChannel = member.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

export async function logUnban(
    repo: Repository<Servers>,
    user: User,
    moderator: GuildMember,
    reason: string
) {
    let server = await repo.findOne({ where: { server: moderator.guild.id } });

    // make sure mod log is enabled and a channel is set
    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle(`User Unbanned | ${user.tag}`)
        .addField('Reason', reason, false)
        .addField('Moderator', moderator.user, true)
        .setThumbnail(user.displayAvatarURL());

    let modLogChannel = moderator.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

// log nick changes through event as well
export async function logNick(
    repo: Repository<Servers>,
    member: GuildMember,
    moderator: GuildMember,
    oldNick: string,
    newNick: string
) {
    let server = await repo.findOne({ where: { server: member.guild.id } });

    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle(`Nickname Changed`)
        .addField('Old Nickname', oldNick ? oldNick : '*N/A*')
        .addField('New Nickname', newNick ? newNick : '*N/A*')
        .addField('Moderator', moderator.user);

    let modLogChannel = member.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

// TODO: Log role add through event as well
export async function logRoleAdd(
    repo: Repository<Servers>,
    member: GuildMember,
    moderator: GuildMember,
    role: Role
) {
    let server = await repo.findOne({ where: { server: member.guild.id } });

    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Role Added')
        .addField('Role', `<@&${role.id}>`, false)
        .addField('Member', member.user, true)
        .addField('Moderator', moderator.user, true);

    let modLogChannel = member.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

// TODO: Log role remove through event as well
export async function logRoleRemove(
    repo: Repository<Servers>,
    member: GuildMember,
    moderator: GuildMember,
    role: Role
) {
    let server = await repo.findOne({ where: { server: member.guild.id } });

    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Role Removed')
        .addField('Role', role, false)
        .addField('Member', member.user, true)
        .addField('Moderator', moderator.user, true);

    let modLogChannel = member.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

export async function logRoleClear(
    repo: Repository<Servers>,
    member: GuildMember,
    moderator: GuildMember,
    roles: Collection<string, Role>
) {
    let server = await repo.findOne({ where: { server: member.guild.id } });

    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Roles Cleared')
        .addField(
            'Roles',
            roles.map((role) => `<@&${role.id}>`).join(', '),
            false
        )
        .addField('Member', member.user, true)
        .addField('Moderator', moderator.user, true);

    let modLogChannel = member.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

export async function logNuke(
    repo: Repository<Servers>,
    channel: TextChannel,
    moderator: GuildMember
) {
    let server = await repo.findOne({ where: { server: channel.guild.id } });

    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Channel Nuked')
        .addField('Channel', `<#${channel.id}>`, true)
        .addField('Moderator', moderator.user, true);

    let modLogChannel = moderator.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

export async function logRolesAddAll(
    repo: Repository<Servers>,
    role: Role,
    moderator: GuildMember
) {
    let server = await repo.findOne({ where: { server: moderator.guild.id } });

    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Mass Role Assignment')
        .addField('Role', role, true)
        .addField('Moderator', moderator.user, true);

    let modLogChannel = moderator.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

export async function logRolesRemoveAll(
    repo: Repository<Servers>,
    role: Role,
    moderator: GuildMember
) {
    let server = await repo.findOne({ where: { server: moderator.guild.id } });

    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Mass Role Removal')
        .addField('Role', role, true)
        .addField('Moderator', moderator.user, true);

    let modLogChannel = moderator.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

export async function logAutoPurge(
    repo: Repository<Servers>,
    msgCount: number,
    channel: TextChannel
) {
    let server = await repo.findOne({ where: { server: channel.guild.id } });

    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Auto Purge')
        .addField('Deleted Messages', msgCount, true)
        .addField('Channel', channel, true);

    let modLogChannel = channel.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

export async function logChannelLock(
    repo: Repository<Servers>,
    duration: number,
    channel: TextChannel,
    moderator: GuildMember
) {
    let server = await repo.findOne({ where: { server: channel.guild.id } });

    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Channel Locked')
        .addField('Channel', channel, true)
        .addField('Moderator', moderator, true)
        .addField('Duration', duration ? ms(duration) : 'Indefinite', true);

    let modLogChannel = channel.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

export async function logChannelUnlock(
    repo: Repository<Servers>,
    channel: TextChannel,
    moderator: GuildMember
) {
    let server = await repo.findOne({ where: { server: channel.guild.id } });

    if (!server.modLogEnabled && !server.modLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('Channel Unlocked')
        .addField('Channel', channel, true)
        .addField('Moderator', moderator, true);

    let modLogChannel = channel.guild.channels.cache.get(
        server.modLog
    ) as TextChannel;

    modLogChannel.send(embed);
}

export async function logJoinMsg(server: Servers, member: GuildMember) {
    if (!server.joinMsgEnabled && !server.joinLeaveLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('User Joined')
        .addField('User', member.user, true)
        .addField('ID', member.id, true);

    let joinLeaveLogChannel = member.guild.channels.cache.get(
        server.joinLeaveLog
    ) as TextChannel;

    joinLeaveLogChannel.send(embed);
}

export async function logLeaveMsg(
    repo: Repository<Servers>,
    member: GuildMember
) {
    let server = await repo.findOne({ where: { server: member.guild.id } });

    if (!server.leaveMsgEnabled && !server.joinLeaveLog) {
        return;
    }

    let embed = getDefaultEmbed()
        .setTitle('User Left')
        .addField('User', member.user, true)
        .addField('ID', member.id, true);

    let joinLeaveLogChannel = member.guild.channels.cache.get(
        server.joinLeaveLog
    ) as TextChannel;

    joinLeaveLogChannel.send(embed);
}

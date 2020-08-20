import ms from 'ms';
import { utc } from 'moment';
import 'moment-duration-format';
import { getRepository } from 'typeorm';
import { AkairoClient } from 'discord-akairo';
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
import { getServerById } from './server';

export async function logMsgDelete(msg: Message) {
  const server = await getServerById(msg.member!.guild.id);

  if (
    !server?.messageLogDeletesEnabled ||
    !server?.messageLog ||
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
    .addField('Executor', msg.member!.user, true)
    .setThumbnail(msg.member!.user.displayAvatarURL() ?? '');

  // add attachments
  let attachment = msg.attachments.first();
  if (attachment) embed.addField('Attachment(s)', attachment.url);

  let channel = msg.guild!.channels.cache.get(server.messageLog) as TextChannel;

  channel.send(embed);
}

// TODO: Type event data
export async function logUncachedMsgDelete(
  client: AkairoClient,
  eventData: any
) {
  const server = await getServerById(eventData.guild_id);

  if (!server?.messageLogEditsEnabled || !server?.messageLog) return;

  let embed = getDefaultEmbed()
    .setTitle('Old Message Deleted')
    .addField('Content', '*N/A*', false)
    .addField(
      'Message',
      `[Context](https://discord.com/channels/${eventData.guild_id}/${eventData.channel_id}/${eventData.id})`,
      true
    )
    .addField('ID', eventData.id, true)
    .addField('Channel', `<#${eventData.channel_id}>`, true)
    .addField('Executor', '*N/A*', true);

  let channel = client.channels.cache.get(server.messageLog) as TextChannel;

  channel.send(embed);
}

export async function logMsgEdit(oldMsg: Message, newMsg: Message) {
  const server = await getServerById(newMsg.member!.guild.id);

  if (
    !server?.messageLogEditsEnabled ||
    !server?.messageLog ||
    newMsg.author.bot
  )
    return;

  let embed = getDefaultEmbed()
    .setTitle('Message Edited')
    .addField('Before', oldMsg.cleanContent, false)
    .addField('After', newMsg.cleanContent, false)
    .addField('Message', `[Context](${newMsg.url})`, true)
    .addField('ID', newMsg.id, true)
    .addField('Channel', newMsg.channel, true)
    .addField('Executor', newMsg.member?.user, true)
    .setThumbnail(newMsg.member!.user.displayAvatarURL() ?? '');

  let channel = newMsg.guild!.channels.cache.get(
    server.messageLog
  ) as TextChannel;

  channel.send(embed);
}

// TODO: Type the event data
export async function logUncachedMsgEdit(client: AkairoClient, eventData: any) {
  const server = await getServerById(eventData.guild_id);

  if (!server?.messageLogEditsEnabled || !server?.messageLog) return;

  let embed = getDefaultEmbed()
    .setTitle('Old Message Edited')
    .addField('Before', '*N/A*', false)
    .addField('After', eventData.content, false)
    .addField(
      'Message',
      `[Context](https://discord.com/channels/${eventData.guild_id}/${eventData.channel_id}/${eventData.id})`,
      true
    )
    .addField('ID', eventData.id, true)
    .addField('Channel', `<#${eventData.channel_id}>`, true)
    .addField(
      'Executor',
      `${eventData.author.username + '#' + eventData.author.discriminator} (${
        eventData.author.id
      })`,
      true
    )
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${eventData.author.id}/${eventData.author.avatar}`
    );

  let channel = client.channels.cache.get(server.messageLog) as TextChannel;

  channel.send(embed);
}

export async function logImageUpload(msg: Message) {
  const server = await getServerById(msg.member!.guild.id);

  if (!server?.messageLogImagesEnabled || !server?.messageLog || msg.author.bot)
    return;

  let embed = getDefaultEmbed()
    .setTitle('Image Uploaded')
    .addField('ID', msg.id, true)
    .addField('Channel', msg.channel, true)
    .addField('User', msg.member!.user, true);

  embed.attachFiles(
    Array.from(msg.attachments.values()).map((attachment) => attachment.url)
  );

  let channel = msg.guild!.channels.cache.get(server.messageLog) as TextChannel;

  channel.send(embed);
}

export async function logCommandExecute(msg: Message) {
  const server = await getServerById(msg.member!.guild.id);

  if (!server?.commandLogEnabled || !server?.modLog) {
    return;
  }

  let embed = getDefaultEmbed()
    .setTitle('Command Executed')
    .addField('Command', msg.content, false)
    .addField('Executor', msg.member!.user, true)
    .setThumbnail(msg.member!.user.displayAvatarURL());

  let channel = msg.guild!.channels.cache.get(server.commandLog) as TextChannel;

  channel.send(embed);
}

export async function logMute(
  member: GuildMember,
  reason: string,
  duration: number,
  moderator: GuildMember
) {
  const server = await getServerById(member.guild.id);

  // make sure mod log is enabled and a channel is set
  if (!server?.modLogEnabled && !server?.modLog) {
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

export async function logUnmute(member: GuildMember, moderator: GuildMember) {
  const server = await getServerById(member.guild.id);

  // make sure mod log is enabled and a channel is set
  if (!server?.modLogEnabled || !server?.modLog) {
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
  moderator: GuildMember,
  count: number,
  msgs: Collection<string, Message>
) {
  const server = await getServerById(moderator.guild.id);

  // make sure mod log is enabled and a channel is set
  if (!server?.modLogEnabled || !server?.modLog) {
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

export async function logKick(
  member: GuildMember,
  reason: string,
  moderator: GuildMember
) {
  const server = await getServerById(member.guild.id);

  // make sure mod log is enabled and a channel is set
  if (!server?.modLogEnabled && !server?.modLog) {
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

export async function logBan(
  user: User,
  reason: string,
  moderator: GuildMember,
  duration: string = 'Indefinite'
) {
  const server = await getServerById(moderator.guild.id);

  // make sure mod log is enabled and a channel is set
  if (!server?.modLogEnabled && !server?.modLog) {
    return;
  }

  let embed = getDefaultEmbed()
    .setTitle(`User Banned | ${user.tag}`)
    .addField('Reason', reason, false)
    .addField('Moderator', moderator.user, true)
    .addField('Duration', duration, true)
    .setThumbnail(user.displayAvatarURL());

  let modLogChannel = moderator.guild.channels.cache.get(
    server.modLog
  ) as TextChannel;

  modLogChannel.send(embed);
}

export async function logUnban(
  user: User,
  moderator: GuildMember,
  reason: string
) {
  const server = await getServerById(moderator.guild.id);

  // make sure mod log is enabled and a channel is set
  if (!server?.modLogEnabled && !server?.modLog) {
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
  member: GuildMember,
  moderator: GuildMember,
  oldNick: string,
  newNick: string
) {
  const server = await getServerById(member.guild.id);

  if (!server?.modLogEnabled && !server?.modLog) {
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
  member: GuildMember,
  moderator: GuildMember,
  role: Role
) {
  const server = await getServerById(member.guild.id);

  if (!server?.modLogEnabled && !server?.modLog) {
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
  member: GuildMember,
  moderator: GuildMember,
  role: Role
) {
  const server = await getServerById(member.guild.id);

  if (!server?.modLogEnabled && !server?.modLog) {
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
  member: GuildMember,
  moderator: GuildMember,
  roles: Collection<string, Role>
) {
  const server = await getServerById(member.guild.id);

  if (!server?.modLogEnabled && !server?.modLog) {
    return;
  }

  let embed = getDefaultEmbed()
    .setTitle('Roles Cleared')
    .addField('Roles', roles.map((role) => `<@&${role.id}>`).join(', '), false)
    .addField('Member', member.user, true)
    .addField('Moderator', moderator.user, true);

  let modLogChannel = member.guild.channels.cache.get(
    server.modLog
  ) as TextChannel;

  modLogChannel.send(embed);
}

export async function logNuke(channel: TextChannel, moderator: GuildMember) {
  const server = await getServerById(channel.guild.id);

  if (!server?.modLogEnabled && !server?.modLog) {
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

export async function logRolesAddAll(role: Role, moderator: GuildMember) {
  const server = await getServerById(moderator.guild.id);

  if (!server?.modLogEnabled && !server?.modLog) {
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

export async function logRolesRemoveAll(role: Role, moderator: GuildMember) {
  const server = await getServerById(moderator.guild.id);

  if (!server?.modLogEnabled && !server?.modLog) {
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

export async function logAutoPurge(msgCount: number, channel: TextChannel) {
  const server = await getServerById(channel.guild.id);

  if (!server?.modLogEnabled && !server?.modLog) {
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
  duration: number,
  channel: TextChannel,
  moderator: GuildMember
) {
  const server = await getServerById(channel.guild.id);

  if (!server?.modLogEnabled && !server?.modLog) {
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
  channel: TextChannel,
  moderator: GuildMember
) {
  const server = await getServerById(channel.guild.id);

  if (!server?.modLogEnabled && !server?.modLog) {
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

export async function logJoinMsg(member: GuildMember) {
  const server = await getServerById(member.guild.id);

  if (!server?.joinMsgEnabled && !server?.joinLeaveLog) {
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

export async function logLeaveMsg(member: GuildMember) {
  const server = await getServerById(member.guild.id);

  if (!server?.leaveMsgEnabled && !server?.joinLeaveLog) {
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

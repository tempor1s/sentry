import { AkairoClient } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import logger from '../utils/logger';
import { ChannelLocks } from '../models/channelLocks';
import { getRepository } from 'typeorm';
import { logChannelUnlock } from './serverlogs';
import { getDefaultEmbed } from '../utils/message';
import ms from 'ms';
import { getServerById } from './server';

export async function unlockChannelLoop(client: AkairoClient): Promise<void> {
  const locksRepo = getRepository(ChannelLocks);

  const channelLocks = await locksRepo.find({ relations: ['server'] });
  channelLocks
    .filter(
      (channel) => channel.end <= Date.now() && channel.indefinite === false
    )
    .map(async (channel) => {
      await locksRepo.delete(channel);
      // get the server to remove ban from
      let lockedChan = client.channels.cache.get(
        channel.channel
      ) as TextChannel;

      let clientMember = lockedChan.guild.members.cache.get(client.user!.id);

      let unlocked = await unlockChannel(lockedChan);
      if (!unlocked) lockedChan.send('Failed to unlock channel.');

      logChannelUnlock(lockedChan, clientMember!);
    });
}

// "locks" given channel by disabling permissions
export async function lockChannel(
  channel: TextChannel,
  duration: number
): Promise<boolean> {
  const locksRepo = getRepository(ChannelLocks);

  // make sure the channel is not already locked
  let channelLock = await locksRepo.findOne({
    where: { server: channel.guild.id, channel: channel.id },
  });
  if (channelLock) return false;

  let everyoneRole = channel.guild.roles.cache.find(
    (role) => role.name === '@everyone'
  );

  // overwrite @everyone role
  channel.updateOverwrite(everyoneRole!.id, { SEND_MESSAGES: false });

  // overwrite all permissions of CURRENT overwrites
  channel.permissionOverwrites.map((overwrite) => {
    let overwriteChanId = overwrite.id;

    channel.updateOverwrite(overwriteChanId, { SEND_MESSAGES: false });
  });

  logger.debug(
    `Locked channel ${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})`
  );

  channel.send(
    getDefaultEmbed()
      .setTitle('Channel Locked')
      .addField('Duration', duration ? ms(duration) : 'Indefinite', true)
  );

  // TODO: query builder
  const server = await getServerById(channel.guild.id);

  await locksRepo.insert({
    server,
    channel: channel.id,
    end: Date.now() + duration,
    indefinite: duration === 0 ? true : false,
  });

  return true;
}

export async function unlockChannel(channel: TextChannel): Promise<boolean> {
  const locksRepo = getRepository(ChannelLocks);

  // get the channels lock
  let channelLock = await locksRepo.findOne({
    where: { server: channel.guild.id, channel: channel.id },
  });
  if (!channelLock) return false;

  let everyoneRole = channel.guild.roles.cache.find(
    (role) => role.name === '@everyone'
  );

  // overwrite @everyone role
  channel.updateOverwrite(everyoneRole!.id, { SEND_MESSAGES: null });

  // overwrite all permissions of CURRENT overwrites besides MUTE role
  channel.permissionOverwrites.map((overwrite) => {
    let overwriteRole = channel.guild.roles.cache.get(overwrite.id);
    // check to make sure we are not modifying the muted role overrides
    if (!overwriteRole?.name.toLowerCase().includes('mute')) {
      channel.updateOverwrite(overwrite.id, { SEND_MESSAGES: null });
    }
  });

  logger.debug(
    `Unlocked channel ${channel.name} (${channel.id}) in ${channel.guild.name} ${channel.guild.id}`
  );

  const server = await getServerById(channel.guild.id);

  await locksRepo.delete({
    server,
    channel: channel.id,
  });

  channel.send('Channel unlocked! :)');

  return true;
}

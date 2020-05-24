import { TextChannel } from 'discord.js';
import logger from '../utils/logger';
import { ChannelLocks } from '../models/channelLocks';
import { Repository } from 'typeorm';

// "locks" given channel by disabling j
export async function lockChannel(
    locksRepo: Repository<ChannelLocks>,
    channel: TextChannel,
    duration: number
): Promise<boolean> {
    // make sure the channel is not already locked
    let channelLock = await locksRepo.findOne({
        where: { server: channel.guild.id, channel: channel.id },
    });
    if (channelLock) return false;

    let everyoneRole = channel.guild.roles.cache.find(
        (role) => role.name === '@everyone'
    );

    // overwrite @everyone role
    channel.updateOverwrite(everyoneRole.id, { SEND_MESSAGES: false });

    // overwrite all permissions of CURRENT overwrites
    channel.permissionOverwrites.map((overwrite) => {
        let overwriteChanId = overwrite.id;

        channel.updateOverwrite(overwriteChanId, { SEND_MESSAGES: false });
    });

    logger.debug(
        `Locked channel ${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})`
    );

    channel.send('Channel locked! :)');

    await locksRepo.insert({
        server: channel.guild.id,
        channel: channel.id,
        end: Date.now() + duration,
        indefinite: duration ? false : true,
    });

    return true;
}

export async function unlockChannel(
    locksRepo: Repository<ChannelLocks>,
    channel: TextChannel
): Promise<boolean> {
    // get the channels lock
    let channelLock = await locksRepo.findOne({
        where: { server: channel.guild.id, channel: channel.id },
    });
    if (!channelLock) return false;

    let everyoneRole = channel.guild.roles.cache.find(
        (role) => role.name === '@everyone'
    );

    // overwrite @everyone role
    channel.updateOverwrite(everyoneRole.id, { SEND_MESSAGES: null });

    // overwrite all permissions of CURRENT overwrites besides MUTE role
    channel.permissionOverwrites.map((overwrite) => {
        let overwriteRole = channel.guild.roles.cache.get(overwrite.id);
        // check to make sure we are not modifying the muted role overrides
        if (!overwriteRole.name.toLowerCase().includes('mute')) {
            channel.updateOverwrite(overwrite.id, { SEND_MESSAGES: null });
        }
    });

    logger.debug(
        `Unlocked channel ${channel.name} (${channel.id}) in ${channel.guild.name} ${channel.guild.id}`
    );

    channel.send('Channel unlocked! :)');

    await locksRepo.delete({
        server: channel.guild.id,
        channel: channel.id,
    });

    return true;
}

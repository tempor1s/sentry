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

    channel.send('Channel locked! :)');

    await locksRepo.insert({
        server: channel.guild.id,
        channel: channel.id,
        end: Date.now() + duration,
        indefinite: duration ? false : true,
    });

    return true;
}

export async function unlockChannel(channel: TextChannel) {
    let guild = channel.guild;
}

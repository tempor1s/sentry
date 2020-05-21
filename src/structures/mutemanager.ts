import { GuildMember, Guild, Permissions, Message } from 'discord.js';
import { Repository } from 'typeorm';
import { Mutes } from '../models/mutes';
import { Servers } from '../models/server';
import logger from '../utils/logger';
import ms from 'ms';

export async function mute(
    muteRepo: Repository<Mutes>,
    msg: Message,
    member: GuildMember,
    muteRoleId: string,
    reason: string,
    duration: number
) {
    // TODO: Remove all of their current roles before we assign them the muted role.
    // TODO: Add flag to make it silent and not mute them.

    // Add the muted role
    try {
        await member.roles.add(muteRoleId, `Muted | Reason: ${reason}`);

        logger.debug(
            `Muting ${member.user.tag} (${member.id}) in ${member.guild.name} (${member.guild.id}) for ${duration}ms`
        );
    } catch (err) {
        logger.error(
            `Error muting ${member.user.tag} (${member.id}) in ${member.guild.name} (${member.guild.id}) for ${duration}ms`
        );

        return msg.util?.send(
            'Could not mute user. This is probably due to an issue with permissions.'
        );
    }

    // Get the time that the mute will end
    const end = Date.now() + duration;
    // get all the roles that the user already has
    let roles = member.roles.cache.map((role) => role.id);

    // Insert the mute into the DB
    try {
        await muteRepo.insert({
            server: member.guild.id,
            user: member.user.id,
            end: end,
            reason: reason,
            moderator: member.id,
            roles: roles,
        });

        // Let the user know we muted them
        member.send(
            `You have been muted by ${msg.member.user} in ${
                msg.guild.name
            } for \`${ms(duration)}\``
        );

        logger.debug('Mute insert was successful.');
    } catch (err) {
        logger.error(
            `Error inserting mute for ${member.user.tag} (${member.id}) in ${
                member.guild.name
            } (${member.guild.id}) for ${ms(duration)}`
        );

        return msg.util?.send(
            'Error occured when attempting to mute the user.'
        );
    }
}

export async function unmute(
    muteRepo: Repository<Mutes>,
    member: GuildMember,
    muteRoleId: string
) {
    // TODO: Add back all the roles we removed from them.
    // remove the muted role
    try {
        await member.roles.remove(muteRoleId, 'Unmuted');
        logger.debug(
            `Unmuted ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id})`
        );
    } catch (err) {
        logger.error(`Unable to remove mute role. Reason ${err}`);
    }

    try {
        // Remove mute from the DB
        await muteRepo.delete({
            server: member.guild.id,
            user: member.id,
        });

        await member.send(`You have been unmuted in ${member.guild.name}.`);

        logger.info('Mute db remove was successful');
    } catch (err) {
        logger.error(
            `Error removing mute db entry from ${member.user.tag}' (${member.id}) in ${member.guild.name} (${member.guild.id})`
        );
    }
}

export async function createMuteOrUpdate(
    serverRepo: Repository<Servers>,
    server: Guild
): Promise<string> {
    let muteRoleId: string;

    // see if we can find a muted role
    let mutedRole = server.roles.cache.find((role) =>
        role.name.toLowerCase().includes('muted')
    );

    // We found an already existing muted role and we know its not in the db, update it.
    if (mutedRole) {
        logger.debug(
            `Found muted role ${mutedRole.name} (${mutedRole.id})! Using...`
        );
        // updated out muted role
        muteRoleId = mutedRole.id;
        try {
            await serverRepo.update(
                { server: server.id },
                { mutedRole: mutedRole.id }
            );
        } catch (err) {
            logger.error(`Error updating muted role for ${server.id}`);
        }
    } else {
        logger.debug('Did not find existing muted role. Creating..');
        muteRoleId = await createMutedRole(serverRepo, server);
    }

    return muteRoleId;
}

async function createMutedRole(
    serverRepo: Repository<Servers>,
    server: Guild
): Promise<string> {
    let role = await server.roles.create({
        data: {
            name: 'Muted',
            color: '808080',
            permissions: [
                Permissions.FLAGS.READ_MESSAGE_HISTORY,
                Permissions.FLAGS.VIEW_CHANNEL,
            ],
            hoist: false,
            mentionable: false,
        },
        reason: 'Muted role for Sentry',
    });

    // TODO: When a new channel is created, deny muted permissions to it

    // deny write permissions for every channel for muted role in server
    server.channels.cache.forEach((channel) => {
        logger.debug(
            `Creating permissions overrides for ${channel.name} (${channel.id})`
        );
        channel.overwritePermissions(
            [{ id: role.id, deny: [Permissions.FLAGS.SEND_MESSAGES] }],
            'Mute role overrides.'
        );
    });

    // add the role id to the server configuration
    try {
        await serverRepo.update({ server: server.id }, { mutedRole: role.id });
    } catch (err) {
        logger.error(`Error updating muted role for ${server.id}`);
    }

    return role.id;
}

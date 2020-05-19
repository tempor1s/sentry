import { GuildMember, Guild, Permissions, Message } from 'discord.js';
import { Repository } from 'typeorm';
import { Mutes } from '../models/mutes';
import { Servers } from '../models/server';
import { duration as dur } from 'moment';

// TODO: Check if a user is muted when they join.

export async function mute(
    muteRepo: Repository<Mutes>,
    msg: Message,
    member: GuildMember,
    muteRoleId: string,
    reason: string,
    duration: number
) {
    // TODO: Mute a given user in a given guild.
    // TODO: Remove all of their current roles before we assign them the muted role.

    // Add the muted role
    await member.roles
        .add(muteRoleId, `Muted | Reason: ${reason}`)
        .catch(() => {
            return msg.util?.send(
                'Could not mute user. This is probably due to an issue with permissions.'
            );
        });

    // Get the time that the mute will end
    const end = Date.now() + duration;

    // Let the user know we muted them
    // TODO: Add flag to make it silent and not mute them.
    member.send(
        `You have been muted by ${msg.member.user} in ${
            msg.guild.name
        } for \`${dur(duration).format('d[d ]h[h ]m[m ]s[s]')}\``
    );

    // TODO: Check to see if they are already muted.
    let roles = member.roles.cache.map((role) => role.id);

    // Insert the mute into the DB
    muteRepo.insert({
        server: member.guild.id,
        user: member.user.id,
        end: end,
        reason: reason,
        moderator: member.id,
        roles: roles,
    });
}

export async function unmute(
    muteRepo: Repository<Mutes>,
    member: GuildMember,
    muteRoleId: string
) {
    // TODO: Add back all the roles we removed from them.
    // remove the muted role
    await member.roles
        .remove(muteRoleId, 'Unmuted')
        .catch((err) =>
            console.log(`Unable to remove mute role. Reason ${err}`)
        );

    // Remove mute from the DB
    await muteRepo.delete({
        server: member.guild.id,
        user: member.id,
    });

    await member.send(`You have been unmuted in ${member.guild.name}.`);
}

export async function createMuteOrUpdate(
    serverRepo: Repository<Servers>,
    server: Guild
): Promise<string> {
    let muteRoleId: string;

    let mutedRole = server.roles.cache.find((role) =>
        role.name.toLowerCase().includes('muted')
    );

    // We found an already existing muted role and we know its not in the db, update it.
    if (mutedRole) {
        // updated out muted role
        muteRoleId = mutedRole.id;
        await serverRepo.update(
            { server: server.id },
            { mutedRole: mutedRole.id }
        );
    } else {
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
        channel.overwritePermissions(
            [{ id: role.id, deny: [Permissions.FLAGS.SEND_MESSAGES] }],
            'Mute role overrides.'
        );
    });

    // add the role id to the server configuration
    await serverRepo.update({ server: server.id }, { mutedRole: role.id });

    return role.id;
}

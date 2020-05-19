import { GuildMember, Guild, Permissions } from 'discord.js';
import { Repository } from 'typeorm';
import { Mutes } from '../models/mutes';
import { Servers } from '../models/server';

export async function mute(user: GuildMember, server: Guild) {
    // TODO: Unmute a given user in a given guild.
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

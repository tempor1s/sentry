import ms from 'ms';
import logger from '../utils/logger';
import { getServerById, updateServerById } from './server';
import { GuildMember, Guild, Permissions, Message, Role } from 'discord.js';
import { AkairoClient } from 'discord-akairo';
import { getRepository } from 'typeorm';
import { logUnmute } from './serverlogs';
import { Mutes } from '../models/mutes';
import { Servers } from '../models/server';
import { dmUser } from '../utils/message';

export const findMutedUser = async (serverId: string, userId: string) => {
  const server = await getServerById(serverId, ['mutes']);

  return server?.mutes.find((mute) => mute.user === userId);
};

export async function unmuteLoop(client: AkairoClient) {
  const mutesRepo = getRepository(Mutes);

  const mutes = await mutesRepo.find({ relations: ['server'] });
  mutes
    .filter((m) => m.end <= Date.now())
    .map(async (m) => {
      let guild = client.guilds.cache.get(m.server.id);
      let member = guild!.members.cache.get(m.user);
      // TODO: This is slow. Optimize with relations or something? :)
      const server = await getServerById(m.server.id);

      // try to mute the user
      try {
        // Unmute the user
        await unmute(member!, server!.mutedRole);
        // Log the unmute
        logUnmute(member!, member!.guild.members.cache.get(client.user!.id)!);

        logger.debug(`Unmuting user ${member!.user.tag} (${member!.id}).`);
      } catch (err) {
        logger.error('Error unmuting user in unmute loop. Reason: ', err);
      }
    });
}

export async function mute(
  msg: Message,
  member: GuildMember,
  muteRoleId: string,
  reason: string,
  duration: number,
  silent: boolean = false
) {
  const muteRepo = getRepository(Mutes);
  // remove all the roles that are not @everyone
  let roles = member.roles.cache
    .filter((role) => role.name !== '@everyone')
    .map((role) => {
      member.roles.remove(role);
      return role.id;
    });

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

  // Insert the mute into the DB
  try {
    // TODO: Use query builder
    const server = await getServerById(member.guild.id);

    await muteRepo.insert({
      server: server,
      user: member.user.id,
      end: Date.now() + duration, // when the mute ends
      reason: reason,
      moderator: member.id,
      roles: roles,
    });

    // Let the user know we muted them if there is no silent flag
    if (silent !== false) {
      await dmUser(
        `You have been muted by ${msg.member!.user} in ${
          msg.guild!.name
        } for \`${ms(duration)}\``,
        member.user
      );
    }

    logger.debug('Mute insert was successful.');
  } catch (err) {
    logger.error(
      `Error inserting mute for ${member.user.tag} (${member.id}) in ${
        member.guild.name
      } (${member.guild.id}) for ${ms(duration)}`
    );

    return msg.util?.send('Error occured when attempting to mute the user.');
  }
}

export async function unmute(member: GuildMember, muteRoleId: string) {
  const muteRepo = getRepository(Mutes);

  try {
    // remove the muted role
    await member.roles.remove(muteRoleId, 'Unmuted');

    logger.debug(
      `Unmuted ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id})`
    );
  } catch (err) {
    logger.error(`Unable to remove mute role. Reason ${err}`);
  }

  // add back all the roles that we removed from them
  let mute = await muteRepo.findOne({
    where: { server: member.guild.id, user: member.id },
  });

  // add roles that we removed initally
  try {
    if (mute!.roles) {
      mute!.roles.map((id) => member.roles.add(id));
    }
  } catch (err) {
    logger.error(
      `Error adding roles to ${member.user.tag} (${member.id}) in ${member.guild.name} (${member.guild.id}). Error: `,
      err
    );
  }

  try {
    // TODO: Use query builder
    const server = await getServerById(member.guild.id);
    // Remove mute from the DB
    await muteRepo.delete({
      server: server,
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

export async function createMuteOrUpdate(server: Guild): Promise<string> {
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
      await updateServerById(server.id, {
        mutedRole: mutedRole.id,
      });
    } catch (err) {
      logger.error(`Error updating muted role for ${server.id}`);
    }
  } else {
    logger.debug('Did not find existing muted role. Creating..');
    muteRoleId = await createMutedRole(server);
  }

  return muteRoleId;
}

export async function getMutedRole(guild: Guild): Promise<Role> {
  const serverRepo = getRepository(Servers);

  let server = await serverRepo.findOne({ where: { server: guild.id } });
  let mutedRole = guild.roles.cache.get(server!.mutedRole);

  return mutedRole!;
}

async function createMutedRole(server: Guild): Promise<string> {
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

  // deny write permissions for every channel for muted role in server
  server.channels.cache.forEach((channel) => {
    logger.debug(
      `Creating permissions overrides for ${channel.name} (${channel.id})`
    );
    // deny send message permissions
    channel.updateOverwrite(
      role,
      { SEND_MESSAGES: false, SPEAK: false },
      'Mute role overrides'
    );
  });

  // add the role id to the server configuration
  try {
    await updateServerById(server.id, { mutedRole: role.id });
  } catch (err) {
    logger.error(`Error updating muted role for ${server.id}`);
  }

  return role.id;
}

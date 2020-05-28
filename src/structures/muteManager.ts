import { GuildMember, Guild, Permissions, Message, Role } from 'discord.js';
import { AkairoClient } from 'discord-akairo';
import { Repository } from 'typeorm';
import { logUnmute } from '../structures/logManager';
import logger from '../utils/logger';
import ms from 'ms';

import { Mutes } from '../models/mutes';
import { Servers } from '../models/server';

export async function unmuteLoop(
  serversRepo: Repository<Servers>,
  mutesRepo: Repository<Mutes>,
  client: AkairoClient
) {
  const mutes = await mutesRepo.find();
  mutes
    .filter((m) => m.end <= Date.now())
    .map(async (m) => {
      let guild = client.guilds.cache.get(m.server);
      let member = guild!.members.cache.get(m.user);
      // TODO: This is slow. Optimize with relations or something? :)
      let serverDb = await serversRepo.findOne({
        where: { server: m.server },
      });

      // try to mute the user
      try {
        // Unmute the user
        await unmute(mutesRepo, member!, serverDb!.mutedRole);
        // Log the unmute
        logUnmute(
          serversRepo,
          member!,
          member!.guild.members.cache.get(client.user!.id)!
        );

        logger.debug(`Unmuting user ${member!.user.tag} (${member!.id}).`);
      } catch (err) {
        logger.error('Error unmuting user in unmute loop. Reason: ', err);
      }
    });
}

export async function mute(
  muteRepo: Repository<Mutes>,
  msg: Message,
  member: GuildMember,
  muteRoleId: string,
  reason: string,
  duration: number,
  silent: boolean = false
) {
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
    await muteRepo.insert({
      server: member.guild.id,
      user: member.user.id,
      end: Date.now() + duration, // when the mute ends
      reason: reason,
      moderator: member.id,
      roles: roles,
    });

    // Let the user know we muted them
    if (!silent) {
      member.send(
        `You have been muted by ${msg.member!.user} in ${
          msg.guild!.name
        } for \`${ms(duration)}\``
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

export async function unmute(
  muteRepo: Repository<Mutes>,
  member: GuildMember,
  muteRoleId: string
) {
  // remove the muted role
  try {
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

export async function getMutedRole(
  serverRepo: Repository<Servers>,
  guild: Guild
): Promise<Role> {
  let server = await serverRepo.findOne({ where: { server: guild.id } });
  let mutedRole = guild.roles.cache.get(server!.mutedRole);

  return mutedRole!;
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
    await serverRepo.update({ server: server.id }, { mutedRole: role.id });
  } catch (err) {
    logger.error(`Error updating muted role for ${server.id}`);
  }

  return role.id;
}

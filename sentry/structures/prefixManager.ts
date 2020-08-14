import { Message, DMChannel } from 'discord.js';
import { AkairoClient, PrefixSupplier, CommandHandler } from 'discord-akairo';
import { defaultPrefix } from '../config';
import { getRepository } from 'typeorm';
import { Servers } from '../models/server';
import logger from '../utils/logger';
import { getAsync, setAsync } from './redis';

export async function getPrefix(msg: Message): Promise<string> {
  if (msg.channel instanceof DMChannel) {
    return defaultPrefix;
  }
  let cachedPrefix = await getAsync(msg.guild!.id);

  // if the prefix is cached then just return that, becasue we do not want to make a db call
  if (cachedPrefix) {
    return cachedPrefix;
  }

  let serverRepo = getRepository(Servers);

  // find the server we want the prefix for
  let server = await serverRepo.findOne({ where: { server: msg.guild?.id } });
  // if we have not seen the server then just return the default prefix
  if (!server) {
    await setAsync(msg.guild!.id, defaultPrefix);
    return defaultPrefix;
  }

  await setAsync(msg.guild!.id, server.prefix);
  return server.prefix;
}

export async function setPrefix(
  msg: Message,
  handler: CommandHandler,
  prefix: string
): Promise<Message | void> {
  let serverPrefix = await (handler.prefix as PrefixSupplier)(msg);

  if (!prefix) {
    return msg.util?.send(`Current Prefix: \`${serverPrefix}\``);
  }

  let serverRepo = getRepository(Servers);

  // update the prefix
  try {
    // set the new prefix in the db
    await serverRepo.update({ server: msg.guild!.id }, { prefix: prefix });
    // set the new prefix in the cache
    await setAsync(msg.guild!.id, prefix);

    logger.debug(
      `Updating prefix in ${msg.guild?.name} (${msg.guild?.id}) from '${serverPrefix}' -> '${prefix}'`
    );
  } catch (err) {
    logger.error(
      `Error updating prefix in ${msg.guild?.name} (${msg.guild?.id}). Reason: `,
      err
    );
  }

  return msg.util?.send(`Updated Prefix: \`${prefix}\``);
}

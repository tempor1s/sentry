import { Message, DMChannel } from 'discord.js';
import { PrefixSupplier, CommandHandler } from 'discord-akairo';
import { defaultPrefix } from '../config';
import logger from '../utils/logger';
import { getAsync, setAsync } from '../structures/redis';
import { getServerById, updateServerById } from './server';

export async function getPrefix(msg: Message): Promise<string> {
  if (msg.channel instanceof DMChannel) {
    return defaultPrefix;
  }
  let cachedPrefix = await getAsync(msg.guild!.id);

  // if the prefix is cached then just return that, becasue we do not want to make a db call
  if (cachedPrefix) {
    return cachedPrefix;
  }

  // find the server we want the prefix for
  const server = await getServerById(msg.guild!.id);
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

  try {
    // set the new prefix in the db
    const updated = await updateServerById(msg.guild!.id, { prefix });

    // failed to update the prefix in the db
    if (!updated)
      return msg.util?.send('Failed to update prefix. Please try again.');

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

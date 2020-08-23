import { getRepository } from 'typeorm';
import { Servers } from '../models/server';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import logger from '../utils/logger';

// TODO: Add caching layer in here

export const createServerById = async (serverId: string) => {
  const repo = getRepository(Servers);

  return await repo.insert({ id: serverId });
};

export const getServerById = async (
  serverId: string,
  relations?: string[]
): Promise<Servers | undefined> => {
  const repo = getRepository(Servers);

  if (relations) {
    return await repo.findOne({ where: { id: serverId }, relations });
  }

  return await repo.findOne({ where: { id: serverId } });
};

export const updateServerById = async (
  serverId: string,
  partialServer: QueryDeepPartialEntity<Servers>
): Promise<boolean> => {
  const repo = getRepository(Servers);

  try {
    const update = await repo.update({ id: serverId }, partialServer);

    // we updated the server entity
    if (update && update.affected && update.affected > 0) return true;

    return false;
  } catch (err) {
    logger.error(err);

    return false;
  }
};

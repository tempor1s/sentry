import { getRepository } from 'typeorm';
import { Servers } from '../models/server';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import logger from '../utils/logger';

export const getServerById = async (
  serverId: string
): Promise<Servers | undefined> => {
  const repo = getRepository(Servers);

  return repo.findOne({ where: { server: serverId } });
};

export const updateServerById = async (
  serverId: string,
  partialServer: QueryDeepPartialEntity<Servers>
): Promise<boolean> => {
  const repo = getRepository(Servers);

  try {
    const update = await repo.update({ server: serverId }, partialServer);

    // we updated the server entity
    if (update && update.affected && update.affected > 0) return true;

    return false;
  } catch (err) {
    logger.error(err);

    return false;
  }
};

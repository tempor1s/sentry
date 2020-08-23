import { getRepository } from 'typeorm';
import { Warnings } from '../models/warnings';
import { getServerById } from './server';
import logger from '../utils/logger';

export const getAllWarnings = async (serverId: string, userId: string) => {
  // TODO: query builder to improve performance

  // get the server
  const server = await getServerById(serverId, ['warnings']);
  const warnings = server?.warnings;

  console.log('warnings', warnings);

  if (!warnings) {
    return null;
  }

  // return only the warnings from the user that we want
  return warnings.filter((warning) => warning.user === userId);
};

interface CreateWarning {
  server: string;
  user: string;
  moderator: string;
  reason: string;
}

export const createWarning = async (createWarningData: CreateWarning) => {
  // TODO: use query builder
  try {
    const server = await getServerById(createWarningData.server);
    const repo = getRepository(Warnings);

    const warning = getRepository(Warnings).create({
      server: server,
      user: createWarningData.user,
      moderator: createWarningData.moderator,
      reason: createWarningData.reason,
    });

    await repo.insert(warning);

    // await getConnection()
    //   .createQueryBuilder()
    //   .relation(Servers, 'warnings')
    //   .of(server)
    //   .add(warning);
  } catch (e) {
    logger.error('error creating warning: ', e);
  }
};

export const removeSingleWarning = async (
  serverId: string,
  userId: string,
  id: number
) => {
  // TODO: Use query builder
  const repo = getRepository(Warnings);
  const server = await getServerById(serverId);

  return repo.delete({ server, user: userId, id });
};

export const removeAllWarnings = async (serverId: string, userId: string) => {
  // TODO: Use query builder
  const repo = getRepository(Warnings);
  const server = await getServerById(serverId);

  return repo.delete({ server, user: userId });
};

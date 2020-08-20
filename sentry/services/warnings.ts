import { getRepository } from 'typeorm';
import { Warnings } from '../models/warnings';
import { Servers } from '../models/server';
import { getServerById } from './server';

export const getAllWarnings = async (serverId: string, userId: string) => {
  const repo = getRepository(Warnings);
  const server = await getServerById(serverId);

  return repo.find({ where: { server: server, user: userId } });
};

interface CreateWarning {
  server: Servers;
  user: string;
  moderator: string;
  reason: string;
}

export const createWarning = async (createWarningData: CreateWarning) => {
  const repo = getRepository(Warnings);

  return repo.insert(createWarningData);
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

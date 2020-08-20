import { getRepository } from 'typeorm';
import { Warnings } from '../models/warnings';

export const getAllWarnings = async (serverId: string, userId: string) => {
  const repo = getRepository(Warnings);

  return repo.find({ where: { server: serverId, user: userId } });
};

interface CreateWarning {
  server: string;
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
  const repo = getRepository(Warnings);

  return repo.delete({ server: serverId, user: userId, id });
};

export const removeAllWarnings = async (serverId: string, userId: string) => {
  const repo = getRepository(Warnings);

  return repo.delete({ server: serverId, user: userId });
};

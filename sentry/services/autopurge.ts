import { getRepository } from 'typeorm';
import { AutoPurges } from '../models/autoPurge';

export const getSingleAutoPurge = async (serverId: string, channel: string) => {
  const repo = getRepository(AutoPurges);

  return repo.findOne({ where: { server: serverId, channel } });
};

export const getAllAutoPurges = async (serverId: string) => {
  const repo = getRepository(AutoPurges);

  return repo.find({ where: { server: serverId } });
};

interface CreateAutoPurge {
  server: string;
  channel: string;
  timeUntilNextPurge: number; // ms
  purgeInterval: number;
}

export const startAutoPurge = async (purgeData: CreateAutoPurge) => {
  const repo = getRepository(AutoPurges);

  const result = await repo.insert(purgeData);

  // insert failed
  if (!result) return false;

  return true;
};

export const stopSingleAutoPurge = async (
  serverId: string,
  channel: string
) => {
  const repo = getRepository(AutoPurges);

  const result = await repo.delete({ server: serverId, channel });

  if (!result) return false;

  return true;
};

export const stopAllAutoPurge = async (serverId: string) => {
  const repo = getRepository(AutoPurges);

  return await repo.delete({ server: serverId });
};

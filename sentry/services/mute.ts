import { getRepository } from 'typeorm';
import { Mutes } from '../models/mutes';

export const findMutedUser = async (serverId: string, userId: string) => {
  const repo = getRepository(Mutes);

  return repo.findOne({ where: { server: serverId, user: userId } });
};

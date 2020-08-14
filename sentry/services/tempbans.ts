import { getRepository } from 'typeorm';
import { TempBans } from '../models/tempBans';

interface CreateTempBan {
  server: string;
  user: string;
  end: number;
  reason: string;
  moderator: string;
}

export const createTempBan = async (tempBanData: CreateTempBan) => {
  const repo = getRepository(TempBans);
  // so that we can unban people later :)
  return repo.insert(tempBanData);
};

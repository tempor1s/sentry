import { Request, Response } from 'express';
import { AkairoClient } from 'discord-akairo';
import { Users } from '../../models/users';

export interface Context {
  req: Request;
  res: Response;
  client: AkairoClient;
  getUser: () => Users;
  logout: () => void;
}

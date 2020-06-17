import { Request, Response } from 'express';
import { AkairoClient } from 'discord-akairo';

export interface Context {
  req: Request;
  res: Response;
  client: AkairoClient;
  getUser: () => any;
  logout: any;
}

import { Request, Response } from 'express';
import { AkairoClient } from 'discord-akairo';

export interface Context {
  req: Request;
  res: Response;
  client: AkairoClient;
  user?: UserPayloadInterface;
}

export interface UserPayloadInterface {
  id: string;
  email: string;
  user: string;
  servers?: string;
}

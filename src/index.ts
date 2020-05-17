import { token, owners } from './config';
import Client from './client/client';
import 'reflect-metadata';

const client: Client = new Client({ token, owners });
client.start();

import 'reflect-metadata';
import { token, owners } from './config';
import Client from './client';

const client: Client = new Client({ token, owners });

client.start();

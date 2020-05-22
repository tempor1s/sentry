import { ConnectionManager } from 'typeorm';
import { dbName, dbHost, dbUsername, dbPassword } from '../config';

import { Warnings } from '../models/warnings';
import { Servers } from '../models/server';
import { Mutes } from '../models/mutes';
import { AutoPurges } from '../models/autopurge';

const connectionManager: ConnectionManager = new ConnectionManager();

connectionManager.create({
    name: dbName,
    type: 'postgres',
    host: dbHost,
    port: 5432,
    username: dbUsername,
    password: dbPassword,
    database: 'sentry',
    synchronize: true, // TODO: Disable this for production through use of env variable
    logging: false,
    entities: [Warnings, Servers, Mutes, AutoPurges],
});

export default connectionManager;

import path from 'path';
import { ConnectionOptions, createConnection } from 'typeorm';
import { dbName, dbHost, dbUsername, dbPassword } from '../config';

// TODO: Pull different config based off of env variables
const connectionOptions: ConnectionOptions = {
  name: dbName,
  type: 'postgres',
  host: dbHost,
  port: 5432,
  username: dbUsername,
  password: dbPassword,
  database: 'sentry',
  synchronize: true, // TODO: Disable this for production through use of env variable
  logging: false,
  entities: [path.join(__dirname, '..', 'models') + '/**{.ts,.js}'],
};

export const createDBConnection = async () => {
  return createConnection({ ...connectionOptions, name: 'default' });
};

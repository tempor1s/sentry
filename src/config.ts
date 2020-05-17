require('dotenv').config();

export let token: string = process.env.BOT_TOKEN;
export let defaultPrefix: string = process.env.DEFAULT_PREFIX;
export let owners: string[] = process.env.OWNERS.split(',');
export let dbName: string = 'sentry';
export let dbHost: string = process.env.DB_HOST;
export let dbUsername: string = process.env.DB_USERNAME;
export let dbPassword: string = process.env.DB_PASSWORD;

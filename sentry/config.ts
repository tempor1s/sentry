import dotenv from 'dotenv';
dotenv.config();

export let token: string = process.env.BOT_TOKEN!;
export let defaultPrefix: string = process.env.DEFAULT_PREFIX!;
export let owners: string[] = process.env.OWNERS!.split(',');
export let dbName: string = 'sentry';
export let dbHost: string = process.env.DB_HOST!;
export let dbUsername: string = process.env.DB_USERNAME!;
export let dbPassword: string = process.env.DB_PASSWORD!;
export let discordClientSecret: string = process.env.CLIENT_SECRET!;
export let callbackUrl: string =
  process.env.CALLBACK_URL ?? 'http://0.0.0.0:8080/auth/discord/callback';
export let sessionSecret: string = process.env.SESSION_SECRET ?? 'secret';
export let domain: string = process.env.DOMAIN ?? '0.0.0.0';
export let redisUrl: string = process.env.REDIS_URL ?? 'redis://cache';
export let redisPassword: string = process.env.REDIS_PASSWORD ?? 'password';
export let serverUrl: string = process.env.SERVER_URL ?? 'https://sentrybot.io';

// export const SERVER = process.env.SERVER ?? 'http://sentry:8080';
// TODO: Clean this up because holy shit is it bad
export const SERVER =
  process.env.NODE_ENV === 'production'
    ? typeof window === 'undefined'
      ? 'http://srv-captain--sentry:8080'
      : 'https://api.sentrybot.io'
    : typeof window === 'undefined'
    ? 'http://sentry:8080'
    : 'http://0.0.0.0:8080';

import { Context, UserPayloadInterface } from '../interfaces/context.interface';
import { verify } from 'jsonwebtoken';
import { MiddlewareFn } from 'type-graphql';
import { handleError, AuthError } from '../utils/errors';

export const auth: MiddlewareFn<Context> = ({ context }, next) => {
  const authed = context.req.headers.authorization;
  if (!authed) return handleError(AuthError.NOT_AUTHENTICATED);

  // Get the bearer token
  const token = authed.split(' ')[1];
  if (!token) return handleError(AuthError.MISSING_TOKEN);

  const user = verify(token, process.env.ACCESS_TOKEN_SECRET!);
  context.user = user as UserPayloadInterface;

  return next();
};

import { ApolloError } from 'apollo-server-express';

export enum AuthError {
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  MISSING_ACCOUNT = 'MISSING_ACCOUNT',
}

function notAuthenticated(): ApolloError {
  throw new ApolloError(AuthError.NOT_AUTHENTICATED, '401', {
    error: {
      title: 'Not Authenticated',
      description: 'You are not authorized!',
    },
  });
}

function missingAccount(): ApolloError {
  throw new ApolloError(AuthError.MISSING_ACCOUNT, '404', {
    error: {
      title: 'Missing Account',
      description: 'Account not found.',
    },
  });
}

export async function handleError(error: AuthError) {
  switch (error) {
    case AuthError.NOT_AUTHENTICATED:
      return notAuthenticated();
    case AuthError.MISSING_ACCOUNT:
      return missingAccount();
    default:
      throw new Error('Internal server error');
  }
}

import { ApolloError } from 'apollo-server-express';

export enum AuthError {
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  MISSING_TOKEN = 'MISSING_TOKEN',
  MISSING_SERVER_USER = 'MISSING_SERVER_USER',
}

function notAuthenticated(): ApolloError {
  throw new ApolloError(AuthError.NOT_AUTHENTICATED, '401', {
    error: {
      title: 'Not Authenticated',
      description: 'You are not authorized!',
    },
  });
}

function missingToken(): ApolloError {
  throw new ApolloError(AuthError.MISSING_TOKEN, '406', {
    error: {
      title: 'Missing Token',
      description:
        "You haven't provided a token or valid format. Format: 'Bearer (token)'",
    },
  });
}

function missingServerUser(): ApolloError {
  throw new ApolloError(AuthError.MISSING_SERVER_USER, '400', {
    error: {
      title: 'Missing User / Server ID',
      description: 'You did not provide a User ID or Server ID.',
    },
  });
}

export async function handleError(error: AuthError) {
  switch (error) {
    case AuthError.NOT_AUTHENTICATED:
      return notAuthenticated();
    case AuthError.MISSING_TOKEN:
      return missingToken();
    case AuthError.MISSING_SERVER_USER:
      return missingServerUser();
    default:
      throw new Error('Internal server error');
  }
}

import { ApolloClient } from 'apollo-client';
import { split, ApolloLink, concat } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { getMainDefinition } from 'apollo-utilities';
import withApollo from 'next-with-apollo';
import { HttpLink } from 'apollo-link-http';
import fetch from 'isomorphic-unfetch';
import Cookies from 'js-cookie';
import { SERVER } from './config';

interface Definiton {
  kind: string;
  operation?: string;
}

let authToken: string | null = null;

const httpLink = new HttpLink({
  fetch,
  uri: SERVER,
});

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      authorization: authToken || null,
    },
  });

  return forward(operation);
});

export const setToken = async (token: string) => {
  try {
    authToken = token ? `Bearer ${token}` : null;
    Cookies.set('token', authToken!, { expires: 7 });
  } catch (error) {
    console.log(error);
  }
};

export const setTokenInRequest = async (token: string) => {
  try {
    authToken = token ? token : null;
    return authToken;
  } catch (error) {
    console.log(error);
  }
};

export const destroyToken = async (token: string) => {
  try {
    Cookies.remove('token');
    authToken = null;
  } catch (error) {
    console.log(error);
  }
};

export default withApollo(
  ({ initialState }) =>
    new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache().restore(initialState || {}),
    })
);

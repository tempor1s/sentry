import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import withApollo from 'next-with-apollo';
import { HttpLink } from 'apollo-link-http';
import fetch from 'isomorphic-unfetch';
import { setContext } from 'apollo-link-context';
import { SERVER } from './config';

const httpLink = new HttpLink({
  fetch,
  uri: SERVER,
  credentials: 'include',
});

const authLink = setContext((_, { headers }: any) => {
  // get auth token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export default withApollo(
  ({ initialState }) =>
    new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache().restore(initialState || {}),
    })
);

import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import withApollo from 'next-with-apollo';
import { createHttpLink, HttpLink } from 'apollo-link-http';
import fetch from 'isomorphic-unfetch';
import { SERVER } from './config';

const httpLink = createHttpLink({
  fetch,
  uri: SERVER + '/graphql',
  credentials: 'include',
});

export default withApollo(
  () =>
    new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
    })
);

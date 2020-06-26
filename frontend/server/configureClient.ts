// import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { SERVER } from './config';
import fetch from 'isomorphic-unfetch';

export default withApollo(
  ({ initialState, headers }) =>
    new ApolloClient({
      uri: `${SERVER}/graphql`,
      fetch: fetch,
      request: (operation: any) => {
        operation.setContext({
          fetchOptions: {
            credentials: 'include',
          },
          headers,
        });
      },
      cache: new InMemoryCache().restore(initialState || {}),
    })
);

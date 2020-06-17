// import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import withApollo from 'next-with-apollo';
import { HttpLink } from 'apollo-link-http';
import ApolloClient from 'apollo-boost';
import { SERVER } from './config';

export default withApollo(
  ({ initialState, headers }) =>
    new ApolloClient({
      uri: `${SERVER}/graphql`,
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

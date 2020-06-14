import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import withApollo from 'next-with-apollo';
import { HttpLink } from 'apollo-link-http';
import fetch from 'isomorphic-unfetch';
import { setContext } from 'apollo-link-context';
import { SERVER } from './config';

// interface Definiton {
//   kind: string;
//   operation?: string;
// }

// let authToken: string | null = null;

// const authMiddleware = new ApolloLink((operation, forward) => {
//   operation.setContext({
//     headers: {
//       authorization: authToken || null,
//     },
//   });
//
//   return forward(operation);
// });
//
// export const setToken = async (token: string) => {
//   try {
//     authToken = token ? `Bearer ${token}` : null;
//     Cookies.set('token', authToken!, { expires: 7 });
//   } catch (error) {
//     console.log(error);
//   }
// };
//
// export const setTokenInRequest = async (token: string) => {
//   try {
//     authToken = token ? token : null;
//     return authToken;
//   } catch (error) {
//     console.log(error);
//   }
// };
//
// export const destroyToken = async (token: string) => {
//   try {
//     Cookies.remove('token');
//     authToken = null;
//   } catch (error) {
//     console.log(error);
//   }
// };

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

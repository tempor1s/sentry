// get basic hello message for a test

import gql from 'graphql-tag';

const GET_HELLO = gql`
  {
    hello
  }
`;

export default GET_HELLO;

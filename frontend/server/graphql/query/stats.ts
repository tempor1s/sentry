// get basic hello message for a test

import gql from 'graphql-tag';

const GET_STATS = gql`
  {
    stats {
      servers
      users
      channels
    }
  }
`;

export default GET_STATS;

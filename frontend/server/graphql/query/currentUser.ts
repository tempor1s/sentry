// get current user stats from the db
import gql from 'graphql-tag';

const GET_CURRENT_USER = gql`
  {
    currentUser {
      id
      email
      servers
    }
  }
`;

export default GET_CURRENT_USER;

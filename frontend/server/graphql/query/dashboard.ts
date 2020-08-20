// get current user stats from the db
import gql from 'graphql-tag';

const DASHBOARD = gql`
  {
    currentUser {
      id
      email
      servers
    }
  }
`;

export default DASHBOARD;

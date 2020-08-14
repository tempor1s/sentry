// get current user stats from the db
import gql from 'graphql-tag';

const GET_SERVER = gql`
  {
    getServerByID(id: "712061754913325056") {
      prefix
      missingPermissionMessages
    }
  }
`;

export default GET_SERVER;

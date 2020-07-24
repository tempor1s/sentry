import gql from 'graphql-tag';

const LOGOUT = gql`
  mutation {
    logout
  }
`;

export default LOGOUT;

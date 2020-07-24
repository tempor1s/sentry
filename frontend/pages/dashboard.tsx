import dynamic from 'next/dynamic';
import GET_CURRENT_USER from 'server/graphql/query/currentUser';
import { AUTHURL } from '../server/config/index';
import styled from 'styled-components';

const Container = dynamic(() => import('../server/components/container'));

interface Data {
  currentUser: {
    id: string;
    email: string;
    servers: number[];
  };
}

interface CurrentUserProps {
  loading: boolean;
  data: Data;
  error: string;
}

const LoginContainer = styled.div`
  display: flex;
  height: 950px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LoginText = styled.p`
  padding-top: 20px;
  text-decoration: underline;
`;

const Dashboard = (props: CurrentUserProps) => {
  const { loading, error, data } = props;

  if (loading) {
    return <h1>Loading...</h1>;
  }

  // error
  if (error) {
    // Router.replace('/');
    return (
      <Container>
        <LoginContainer>
          You need to be logged in to view this page.{' '}
          <a href={AUTHURL}>
            <LoginText>Login now</LoginText>
          </a>
        </LoginContainer>
      </Container>
    );
  }

  return (
    <Container>
      <h1>User Data</h1>
      <h2>User ID: {data.currentUser.id}</h2>
      <h2>User Email: {data.currentUser.email}</h2>
      <h2>Servers:</h2>
      {data.currentUser.servers &&
        data.currentUser.servers.map((server: any) => (
          <p key={server}>Server ID: {server}</p>
        ))}
    </Container>
  );
};

Dashboard.getInitialProps = async (context: any) => {
  try {
    const { data, loading, error } = await context.apolloClient.query({
      query: GET_CURRENT_USER,
      context: {
        credentials: 'include',
        fetchPolicy: 'no-cache',
      },
    });

    return { data, loading, error };
  } catch (error) {
    return {
      error: `Failed to fetch data. ${error}`,
    };
  }
};

export default Dashboard;

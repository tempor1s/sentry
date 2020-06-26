import GET_CURRENT_USER from 'server/graphql/query/currentUser';
import { Container } from '../components/container';

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

const Dashboard = (props: CurrentUserProps) => {
  const { loading, error, data } = props;

  if (loading) {
    return <h1>Loading...</h1>;
  }
  // error
  if (error) {
    return <h1>Error: {error}</h1>;
  }

  return (
    <Container>
      <h1>User Data</h1>
      <h2>User ID: {data.currentUser.id}</h2>
      <h2>User Email: {data.currentUser.email}</h2>
      <h2>Servers:</h2>
      {data.currentUser.servers &&
        data.currentUser.servers.map((server) => (
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

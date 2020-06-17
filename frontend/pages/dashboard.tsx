import GET_CURRENT_USER from 'server/graphql/query/currentUser';

interface Data {
  currentUser: {
    id: string;
    email: string;
    servers: number[];
  };
}

interface StatsProps {
  loading: boolean;
  data: Data;
  error: string;
}

const Dashboard = (props: StatsProps) => {
  const { loading, error, data } = props;

  console.log(error);

  if (loading) {
    return <h1>Loading...</h1>;
  }
  // error
  if (error) {
    return <h1>Error: {error}</h1>;
  }

  return (
    <div>
      <h1>User Data</h1>
      <h2>User ID: {data.currentUser.id}</h2>
      <h2>User Email: {data.currentUser.email}</h2>
      <h2>
        Servers:{' '}
        {data.currentUser.servers.map((server) => (
          <p>Server ID: {server}</p>
        ))}
      </h2>
    </div>
  );
};

Dashboard.getInitialProps = async (context: any) => {
  try {
    const { data, loading, error } = await context.apolloClient.query({
      query: GET_CURRENT_USER,
    });

    return { data, loading, error };
  } catch (error) {
    return {
      error: `Failed to fetch data. ${error}`,
    };
  }
};

export default Dashboard;

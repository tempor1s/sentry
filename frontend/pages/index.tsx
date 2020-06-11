import GET_STATS from '../server/graphql/query/stats';

interface Data {
  stats: Stats;
}

interface Stats {
  servers: number;
  users: number;
  channels: number;
}

interface StatsProps {
  loading: boolean;
  data: Data;
  error: string;
}

const Home = (props: StatsProps) => {
  const { data } = props;

  const stats = data['stats'];

  return (
    <div>
      <h2>Servers: {stats['servers']}</h2>
      <h2>Users: {stats['users']}</h2>
      <h2>Channels: {stats['channels']}</h2>
    </div>
  );
};

Home.getInitialProps = async (context: any) => {
  try {
    const { data, loading } = await context.apolloClient.query({
      query: GET_STATS,
    });

    return { data, loading };
  } catch (error) {
    return {
      error: `Failed to fetch data. ${error}`,
    };
  }
};

export default Home;

import GET_STATS from '../server/graphql/query/stats';

interface Data {
  stats: {
    servers: number;
    users: number;
    channels: number;
  };
}

interface StatsProps {
  loading: boolean;
  data: Data;
  error: string;
}

const Home = (props: StatsProps) => {
  const { data } = props;

  return (
    <div>
      <h1>
        <a href="https://discord.com/api/oauth2/authorize?client_id=557425093425233923&redirect_uri=http%3A%2F%2F0.0.0.0%3A8080%2Fauth%2Fdiscord%2Fcallback&response_type=code&scope=email%20identify%20guilds">
          Authenticate
        </a>
      </h1>
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

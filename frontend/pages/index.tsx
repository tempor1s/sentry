import GET_STATS from '../server/graphql/query/stats';
import styled from 'styled-components';

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

// interface StyleProps {
//   test: boolean;
// }
//
// const Button = styled.button`
//   background-color: ${(props) => props.theme.primary};
//   padding: ${(props: StyleProps) => (props.test ? '25px' : '100px')};
//   h1:
// `;

const Home = (props: StatsProps) => {
  const { data } = props;

  let url =
    process.env.NODE_ENV === 'production'
      ? 'https://sentry.dev.benl.dev/auth/discord'
      : 'http://0.0.0.0:8080/auth/discord';

  return (
    <div>
      <h1>
        <a href={url}>Authenticate</a>
      </h1>
      <h2>Bot Stats</h2>
      <h2>Users: {data.stats.users}</h2>
      <h2>Servers: {data.stats.servers}</h2>
      <h2>Channels: {data.stats.channels}</h2>
      // <Button test={false}>Hi!</Button>
    </div>
  );
};

Home.getInitialProps = async (context: any) => {
  try {
    const { data, loading, error } = await context.apolloClient.query({
      query: GET_STATS,
    });

    return { data, loading, error };
  } catch (error) {
    return {
      error: `Failed to fetch data. ${error}`,
    };
  }
};

export default Home;

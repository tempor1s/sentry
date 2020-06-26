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
// <Button test={false}>Hi!</Button>

const Container = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  font-size: 5em;
  padding-top: 4em;
`;

const SubTitle = styled.h3`
  font-size: 2em;
  padding-top: 0.5em;
  padding-bottom: 0.6em;
`;

const Stats = styled.p`
  font-size: 1.5em;
  padding-top: 2em;
  padding-bottom: 7em;
`;

const Button = styled.button`
  display: inline-block;
  border-radius: 4px;
  padding: 1em 4em;
  min-height: 32px;
  line-height: 1;
  margin-left: 0.5em;
  margin-right: 0.5em;
  font-size: 1.15em;
  text-decoration: none;

  &:hover {
    background-color: white;

    a {
      background-color: white;
      color: black;
    }
  }
`;

const FeaturesTitle = styled.h1`
  font-size: 2.5em;
`;

const Home = (props: StatsProps) => {
  const { data } = props;

  let authUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://sentry.dev.benl.dev/auth/discord'
      : 'http://0.0.0.0:8080/auth/discord';

  let dashUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://sentry.benl.dev/dashboard'
      : 'http://0.0.0.0:3000/dashboard';

  // TODO: Check if logged in and change the invite url

  return (
    <Container>
      <Title>Sentry</Title>
      <SubTitle>Simple & Advanced Moderation Bot For Discord</SubTitle>
      <Button>
        <a href={authUrl}>Invite</a>
      </Button>
      <Button>
        <a href={dashUrl}>Dashboard</a>
      </Button>
      <Stats>
        Sentry is current used on {data.stats.servers} servers watching over{' '}
        {data.stats.users} users.
      </Stats>
      <FeaturesTitle>Key Features</FeaturesTitle>
    </Container>
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

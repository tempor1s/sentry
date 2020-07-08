import styled from 'styled-components';
import { device } from '../server/utils/theme';
import dynamic from 'next/dynamic';
import GET_STATS_AND_USER from '../server/graphql/query/stats';
import { DASHURL, AUTHURL } from '../server/config/index';

const Container = dynamic(() => import('../server/components/container'));

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

const HeaderContent = styled.div`
  display: flex;
  height: 950px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 5em;
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
    cursor: pointer;

    a {
      background-color: white;
      color: black;
      display: block;
    }
  }

  @media ${device.mobileS} {
    margin-bottom: 0.75em;
  }
`;

const FeaturesTitle = styled.h1`
  font-size: 2.5em;
`;

const Home = (props: StatsProps) => {
  const { data, loading, error } = props;

  if (error) return <Container>Error... {error}</Container>;
  if (loading) return <Container>Loading..</Container>;

  // TODO: Check if logged in and change the invite url
  return (
    <Container>
      <HeaderContent>
        <Title>Sentry</Title>
        <SubTitle>Simple & Advanced Moderation Bot For Discord</SubTitle>
        <span>
          <Button>
            <a href={AUTHURL}>Invite</a>
          </Button>
          <Button>
            <a href={DASHURL}>Dashboard</a>
          </Button>
        </span>
        <Stats>
          Sentry is current used on <strong>{data.stats.servers}</strong>{' '}
          servers watching over <strong>{data.stats.users}</strong> users.
        </Stats>
        <FeaturesTitle>Key Features</FeaturesTitle>
      </HeaderContent>
    </Container>
  );
};

Home.getInitialProps = async (context: any) => {
  try {
    const { data, loading, error } = await context.apolloClient.query({
      query: GET_STATS_AND_USER,
    });

    return { data, loading, error };
  } catch (error) {
    return {
      error: `Failed to fetch data. ${error}`,
    };
  }
};

export default Home;

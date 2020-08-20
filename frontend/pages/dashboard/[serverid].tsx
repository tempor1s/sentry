import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import GET_SERVER from '../../server/graphql/query/server';

const Container = dynamic(() => import('../../server/components/container'));

interface Data {
  getServerByID: {
    prefix: string;
    missingPermissionMessages: boolean;
  };
}

interface ServerDashboardProps {
  loading: boolean;
  data: Data;
  error: string;
}

const DashboardContainer = styled.div`
  padding-top: 35px;
  padding-left: 30px;
`;

const ServerDashboardTitle = styled.h1`
  justify-content: left;
  align-items: left;
  padding-bottom: 30px;
`;

const GeneralSettings = styled.div`
  line-height: 2;
  font-size: 20px;
`;

const Modules = styled.div``;

const ModuleCard = styled.div``;

const ServerDashboard = (props: ServerDashboardProps) => {
  // get server id from props
  const router = useRouter();
  const { serverid } = router.query;

  const { data, loading, error } = props;

  if (error) {
    return <Container>Error: error</Container>;
  }

  if (loading) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <DashboardContainer>
        <ServerDashboardTitle>Server Name ({serverid})</ServerDashboardTitle>
        <GeneralSettings>
          <h3>General Settings:</h3>
          <p>Server Prefix: {data && data.getServerByID.prefix}</p>
          <p>
            Missing Permission Command Message:{' '}
            {data && data.getServerByID.missingPermissionMessages === true
              ? 'Enabled'
              : 'Disabled'}
          </p>
        </GeneralSettings>
        <Modules>
          <ModuleCard>
            <p>Logging</p>
          </ModuleCard>
          <ModuleCard>
            <p>Automation</p>
          </ModuleCard>
          <ModuleCard>
            <p>Messages</p>
          </ModuleCard>
          <ModuleCard>
            <p>Antispam (coming soon)</p>
          </ModuleCard>
          <ModuleCard>
            <p>Automod (coming soon)</p>
          </ModuleCard>
        </Modules>
      </DashboardContainer>
    </Container>
  );
};

ServerDashboard.getInitialProps = async (context: any) => {
  try {
    const { data, loading, error } = await context.apolloClient.query({
      query: GET_SERVER,
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

export default ServerDashboard;

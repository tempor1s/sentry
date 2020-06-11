import GET_HELLO from '../server/graphql/query/hello';

interface Data {
  hello: string;
}

interface HelloProps {
  loading: boolean;
  data: Data;
  error: string;
}

// TODO: Get the bot information instead of hello world lol
const Home = (props: HelloProps) => {
  const { data } = props;
  const helloMsg = data['hello'];

  return <div>Data from server: {helloMsg}</div>;
};

Home.getInitialProps = async (context: any) => {
  try {
    const { data, loading } = await context.apolloClient.query({
      query: GET_HELLO,
    });

    return { data, loading };
  } catch (error) {
    return {
      error: `Failed to fetch data. ${error}`,
    };
  }
};

export default Home;

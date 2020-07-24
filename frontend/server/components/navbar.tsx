import React from 'react';
import styled from 'styled-components';
import Container from './container';
import Link from 'next/link';
import Router from 'next/router';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import GET_CURRENT_USER from '../graphql/query/currentUser';
import LOGOUT from '../graphql/mutation/logout';
import { AUTHURL } from '../../server/config/index';

const NavContainer = styled.div`
  width: 100%;
  z-index: 900;
  display: flex;
  align-items: center;
  height: 3em;
  padding: 0.25em 0em;
`;

const NavTitle = styled.h1`
  display: flex;
  align-items: center;
  font-size: 1.5em;
  flex: 1;
`;

const NavRight = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;

  li {
    margin-right: 15px;
    cursor: pointer;
  }
`;

export default function Navbar(): JSX.Element {
  const { data, loading, error } = useQuery(GET_CURRENT_USER);
  const client = useApolloClient();

  // log the user out
  const logoutUser = async (e: any) => {
    e.preventDefault();

    // logout on the server
    await client.mutate({ mutation: LOGOUT });
    // clear the clients store (cache)
    client.clearStore();

    // redirect to home page and reload state
    Router.replace('/');
    Router.reload();
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <NavContainer>
        <NavTitle>
          <Link href="/">
            <a>Home</a>
          </Link>
        </NavTitle>
        <NavRight>
          {!error && !loading && data.currentUser ? (
            <>
              <li>
                <Link href="/dashboard">
                  <a>Dashboard</a>
                </Link>
              </li>
              <li>
                <a onClick={logoutUser}>Logout</a>
              </li>
            </>
          ) : (
            <li>
              <a href={AUTHURL}>Dashboard</a>
            </li>
          )}
        </NavRight>
      </NavContainer>
    </Container>
  );
}

import React from 'react';
import styled from 'styled-components';
import Container from './container';
import Link from 'next/link';
import { useQuery } from '@apollo/react-hooks';
import GET_CURRENT_USER from '../graphql/query/currentUser';
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
  }
`;

export default function Navbar(): JSX.Element {
  const { data, loading, error } = useQuery(GET_CURRENT_USER);

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
          <li>
            {!error && !loading && data.currentUser ? (
              <Link href="/dashboard">
                <a>Dashboard</a>
              </Link>
            ) : (
              <a href={AUTHURL}>Login</a>
            )}
          </li>
        </NavRight>
      </NavContainer>
    </Container>
  );
}

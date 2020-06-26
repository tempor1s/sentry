import React from 'react';
import styled from 'styled-components';
import Container from './container';
import Link from 'next/link';

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
            <Link href="/dashboard">
              <a>Dashboard</a>
            </Link>
          </li>
        </NavRight>
      </NavContainer>
    </Container>
  );
}

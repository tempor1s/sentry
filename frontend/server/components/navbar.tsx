import React from 'react';
import styled from 'styled-components';
import Container from './container';

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
        <NavTitle>Sentry</NavTitle>
        <NavRight>
          <li>Dashboard</li>
          <li>Premium</li>
        </NavRight>
      </NavContainer>
    </Container>
  );
}

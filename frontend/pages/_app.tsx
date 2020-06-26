import { ThemeProvider } from 'styled-components';
import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { ApolloProvider } from '@apollo/react-hooks';
import withApollo from '../server/configureClient';
import { GlobalStyle } from '../server/utils/globalstyles';
import { darkTheme, lightTheme } from '../server/utils/theme';

const Navbar = dynamic(() => import('../server/components/navbar'));

class SentryFrontend extends App<any> {
  render() {
    const { Component, pageProps, apollo } = this.props;
    return (
      <ApolloProvider client={apollo}>
        <ThemeProvider theme={darkTheme ? darkTheme : lightTheme}>
          <GlobalStyle />
          <Head>
            <link
              href="https://fonts.googleapis.com/css?family=Roboto"
              rel="stylesheet"
            />
          </Head>
          <Navbar />
          <Component {...pageProps} />
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

// wraps all components with data provider from apollo
export default withApollo(SentryFrontend);

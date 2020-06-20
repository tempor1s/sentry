import { ThemeProvider } from 'styled-components';
import React from 'react';
import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import withApollo from '../server/configureClient';
import { GlobalStyle } from '../server/utils/globalstyles';
import { darkTheme, lightTheme } from '../server/utils/theme';

class SentryFrontend extends App<any> {
  render() {
    const { Component, pageProps, apollo } = this.props;
    return (
      <ApolloProvider client={apollo}>
        <ThemeProvider theme={darkTheme ? darkTheme : lightTheme}>
          <GlobalStyle />
          <Component {...pageProps} />
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

// wraps all components with data provider from apollo
export default withApollo(SentryFrontend);


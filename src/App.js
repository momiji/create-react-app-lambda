import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { gql } from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';


const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    new HttpLink({
      uri: '/.netlify/functions/graphql',
      credentials: 'same-origin'
    })
  ]),
  cache: new InMemoryCache()
});

const LambdaDemo = () => (
  <ApolloProvider client={client}>
    <Query query={ gql`{ hello }` }>
      { ({data}) => <div>A greeting from the server: {data && data.hello}</div> }
    </Query>
  </ApolloProvider>
);

class LambdaDemoX extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, msg: null };
  }

  handleClick = api => e => {
    e.preventDefault();

    this.setState({ loading: true });
    fetch('/.netlify/functions/' + api)
      .then(response => response.json())
      .then(json => this.setState({ loading: false, msg: json.msg }));
  };

  render() {
    const { loading, msg } = this.state;

    return (
      <p>
        <button onClick={this.handleClick('hello')}>
          {loading ? 'Loading...' : 'Call Lambda'}
        </button>
        <button onClick={this.handleClick('async-chuck-norris')}>
          {loading ? 'Loading...' : 'Call Async Lambda'}
        </button>
        <br />
        <span>{msg}</span>
      </p>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <LambdaDemo />
        </header>
      </div>
    );
  }
}

export default App;

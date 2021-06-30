import { ApolloClient, InMemoryCache } from '@apollo/client'

// export const client = new ApolloClient({
//   uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-alt',
//   cache: new InMemoryCache(),
//   queryDeduplication: true,
//   defaultOptions: {
//     watchQuery: {
//       fetchPolicy: 'no-cache',
//     },
//     query: {
//       fetchPolicy: 'no-cache',
//       errorPolicy: 'all',
//     },
//   },
// })

export const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/mshahzaibhabib/aqua-uniswap-v3-stats',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: { watchQuery: { fetchPolicy: 'no-cache' }, query: { fetchPolicy: 'no-cache', errorPolicy: 'all' } },
})

export const healthClient = new ApolloClient({
  uri: 'https://api.thegraph.com/index-node/graphql',
  cache: new InMemoryCache(),
})

export const blockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/rinkeby-blocks',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
})

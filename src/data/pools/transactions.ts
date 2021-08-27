import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import gql from 'graphql-tag'
import { Transaction, TransactionType } from 'types'
import { formatTokenSymbol } from 'utils/tokens'

const POOL_TRANSACTIONS = gql`
  query transactions($address: String!) {
    stakes(first: 100, orderBy: stakeTime, orderDirection: desc, where: { pool: $address }, subgraphError: allow) {
      id
      transactionHash

      token
      tokenAmount

      aquaPremium

      pool
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }

      reserve0
      reserve1

      totalReservesDrivedUSD

      staker

      stakeTime
      handler
    }

    unstakes(first: 100, orderBy: unstakeTime, orderDirection: desc, where: { pool: $address }, subgraphError: allow) {
      id
      transactionHash

      token
      tokenAmount

      pool
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }

      reserve0
      reserve1

      totalReservesDrivedUSD

      aquaPremium

      aquaPremiumAmount
      aquaPremiumAmountDrivedUSD

      aquaAmount
      aquaAmountDrivedUSD

      staker

      unstakeTime
    }
  }
`

interface TransactionResults {
  stakes: {
    id: string
    transactionHash: string

    token: string
    tokenAmount: string

    pool: string
    token0: {
      id: string
      symbol: string
    }
    token1: {
      id: string
      symbol: string
    }

    reserve0: string
    reserve1: string

    totalReservesDrivedUSD: string

    aquaPremium: string

    staker: string

    stakeTime: string
    handler: string
  }[]
  unstakes: {
    id: string
    transactionHash: string

    token: string
    tokenAmount: string

    pool: string
    token0: {
      id: string
      symbol: string
    }
    token1: {
      id: string
      symbol: string
    }

    reserve0: string
    reserve1: string

    totalReservesDrivedUSD: string

    aquaPremium: string

    aquaPremiumAmount: string
    aquaPremiumAmountDrivedUSD: string

    aquaAmount: string
    aquaAmountDrivedUSD: string

    staker: string

    unstakeTime: string
  }[]
}

export async function fetchPoolTransactions(
  address: string,
  client: ApolloClient<NormalizedCacheObject>
): Promise<{ data: Transaction[] | undefined; error: boolean; loading: boolean }> {
  const { data, error, loading } = await client.query<TransactionResults>({
    query: POOL_TRANSACTIONS,
    variables: {
      address: address,
    },
    fetchPolicy: 'cache-first',
  })

  if (error) {
    return {
      data: undefined,
      error: true,
      loading: false,
    }
  }

  if (loading && !data) {
    return {
      data: undefined,
      error: false,
      loading: true,
    }
  }

  console.log('POOL_TRANS_INTERNAL', data, error, loading)

  const mints = data.stakes.map((m) => {
    return {
      type: TransactionType.STAKE,
      id: m.id,
      transactionHash: m.transactionHash,
      account: m.staker,

      token: m.token,
      tokenAmount: parseFloat(m.tokenAmount),

      pool: m.pool,
      token0: {
        id: m.token0.id,
        symbol: m.token0.symbol,
      },
      token1: {
        id: m.token1.id,
        symbol: m.token1.symbol,
      },

      reserve0: parseFloat(m.reserve0),
      reserve1: parseFloat(m.reserve1),

      totalReservesDrivedUSD: parseFloat(m.totalReservesDrivedUSD),

      aquaPremium: parseFloat(m.aquaPremium) / 100,

      aquaPremiumAmount: 0,
      aquaPremiumAmountDrivedUSD: 0,

      aquaAmount: 0,
      aquaAmountDrivedUSD: 0,

      timestamp: m.stakeTime,
    }
  })
  const burns = data.unstakes.map((m) => {
    return {
      type: TransactionType.UNSTAKE,
      id: m.id,
      transactionHash: m.transactionHash,
      account: m.staker,

      token: m.token,
      tokenAmount: parseFloat(m.tokenAmount),

      pool: m.pool,
      token0: {
        id: m.token0.id,
        symbol: m.token0.symbol,
      },
      token1: {
        id: m.token1.id,
        symbol: m.token1.symbol,
      },

      reserve0: parseFloat(m.reserve0),
      reserve1: parseFloat(m.reserve1),

      totalReservesDrivedUSD: parseFloat(m.totalReservesDrivedUSD),

      aquaPremium: parseFloat(m.aquaPremium) / 100,

      aquaPremiumAmount: parseFloat(m.aquaPremiumAmount),
      aquaPremiumAmountDrivedUSD: parseFloat(m.aquaPremiumAmountDrivedUSD),

      aquaAmount: parseFloat(m.aquaAmount),
      aquaAmountDrivedUSD: parseFloat(m.aquaPremiumAmountDrivedUSD),

      timestamp: m.unstakeTime,
    }
  })

  return { data: [...mints, ...burns], error: false, loading: false }
}

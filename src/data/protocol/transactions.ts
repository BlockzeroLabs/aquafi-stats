import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import gql from 'graphql-tag'
import { useEffect } from 'react'
import { Transaction, TransactionType } from 'types'
import { formatTokenSymbol } from 'utils/tokens'

const GLOBAL_TRANSACTIONS = gql`
  query transactions {
    transactions(first: 500, orderBy: timestamp, orderDirection: desc, subgraphError: allow) {
      id
      timestamp

      stakes {
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

      unstakes {
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
  }
`

type TransactionEntry = {
  timestamp: string
  id: string
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

interface TransactionResults {
  transactions: TransactionEntry[]
}

export async function fetchTopTransactions(
  client: ApolloClient<NormalizedCacheObject>
): Promise<Transaction[] | undefined> {
  try {
    const { data, error, loading } = await client.query<TransactionResults>({
      query: GLOBAL_TRANSACTIONS,
      fetchPolicy: 'cache-first',
    })

    console.log('PROTOCOL_DATA_TRANS', error || loading || !data, error, loading, !data)

    if (error || loading || !data) {
      return undefined
    }

    const formatted = data.transactions.reduce((accum: Transaction[], t: TransactionEntry) => {
      const stakeEntries = t.stakes.map((m) => {
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

          // type: TransactionType.STAKE,
          // hash: t.id,
          // timestamp: t.timestamp,
          // sender: m.origin,
          // token0Symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
          // token1Symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
          // token0Address: m.pool.token0.id,
          // token1Address: m.pool.token1.id,
          // amountUSD: parseFloat(m.amountUSD),
          // amountToken0: parseFloat(m.amount0),
          // amountToken1: parseFloat(m.amount1),
        }
      })
      const unstakeEntries = t.unstakes.map((m) => {
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
          aquaAmountDrivedUSD: parseFloat(m.aquaAmountDrivedUSD),

          timestamp: m.unstakeTime,

          // type: TransactionType.UNSTAKE,
          // hash: t.id,
          // timestamp: t.timestamp,
          // sender: m.origin,
          // token0Symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
          // token1Symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
          // token0Address: m.pool.token0.id,
          // token1Address: m.pool.token1.id,
          // amountUSD: parseFloat(m.amountUSD),
          // amountToken0: parseFloat(m.amount0),
          // amountToken1: parseFloat(m.amount1),
        }
      })
      accum = [...accum, ...stakeEntries, ...unstakeEntries]
      return accum
    }, [])

    return formatted
  } catch {
    return undefined
  }
}

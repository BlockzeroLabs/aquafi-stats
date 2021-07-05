import { client } from 'apollo/client'
import gql from 'graphql-tag'
import { Transaction, TransactionType } from 'types'
import { formatTokenSymbol } from 'utils/tokens'

const GLOBAL_TRANSACTIONS = gql`
  query transactions {
    transactions {
      stakes {
        id
        pool {
          feeTier
          token0 {
            symbol
          }
          token1 {
            symbol
          }
        }
        tokenId
        totalValueLocked
        staker
        stakeTime
      }
      unstakes {
        id
        pool {
          feeTier
          token0 {
            symbol
          }
          token1 {
            symbol
          }
        }
        tokenId
        totalValueLocked

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
    pool: {
      feeTier: string
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    tokenId: string
    totalValueLocked: string
    staker: string
    stakeTime: string
    // pool: {
    //   token0: {
    //     id: string
    //     symbol: string
    //   }
    //   token1: {
    //     id: string
    //     symbol: string
    //   }
    // }
    // origin: string
    // amount0: string
    // amount1: string
    // amountUSD: string
  }[]
  unstakes: {
    id: string

    pool: {
      feeTier: string
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }

    tokenId: string
    totalValueLocked: string
    // staker: string
    stakeTime: string
  }[]
  // burns: {
  //   pool: {
  //     token0: {
  //       id: string
  //       symbol: string
  //     }
  //     token1: {
  //       id: string
  //       symbol: string
  //     }
  //   }
  //   owner: string
  //   origin: string
  //   amount0: string
  //   amount1: string
  //   amountUSD: string
  //   }[]
}

interface TransactionResults {
  transactions: TransactionEntry[]
}

export async function fetchTopTransactions(): Promise<Transaction[] | undefined> {
  try {
    const { data, error, loading } = await client.query<TransactionResults>({
      query: GLOBAL_TRANSACTIONS,
      fetchPolicy: 'network-only',
    })

    if (error || loading || !data) {
      return undefined
    }
    console.log('PT TXN DATA=====', data)

    const formatted = data.transactions.reduce((accum: Transaction[], t: TransactionEntry) => {
      console.log('FORMATTED DATA IN fffffffffffffffffTXN ====')

      const mintEntries = t.stakes.map((m) => {
        return {
          type: TransactionType.MINT,
          hash: t.id,
          timestamp: m.stakeTime,

          pool: {
            feeTier: m.pool.feeTier,
            token0: {
              id: m.pool.token0.id,

              symbol: m.pool.token0.symbol,
            },
            token1: {
              id: m.pool.token1.id,

              symbol: m.pool.token1.symbol,
            },
          },
          tokenId: m.tokenId,
          totalValueLocked: m.totalValueLocked,
          staker: m.staker,
          stakeTime: m.stakeTime,
        }
      })
      const burnEntries = t.unstakes.map((m) => {
        return {
          type: TransactionType.BURN,
          hash: t.id,

          timestamp: m.stakeTime,

          pool: {
            feeTier: m.pool.feeTier,
            token0: {
              id: m.pool.token0.id,

              symbol: m.pool.token0.symbol,
            },
            token1: {
              id: m.pool.token1.id,

              symbol: m.pool.token1.symbol,
            },
          },
          tokenId: m.tokenId,
          totalValueLocked: m.totalValueLocked,
          staker: '0xb520bb16aeb6f1b38508ba24da30d6fcf76da3cb',
          stakeTime: m.stakeTime,
        }
      })

      // const swapEntries = t.swaps.map((m) => {
      //   return {
      //     hash: t.id,
      //     type: TransactionType.SWAP,
      //     timestamp: t.timestamp,
      //     sender: m.origin,
      //     token0Symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
      //     token1Symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
      //     token0Address: m.pool.token0.id,
      //     token1Address: m.pool.token1.id,
      //     amountUSD: parseFloat(m.amountUSD),
      //     amountToken0: parseFloat(m.amount0),
      //     amountToken1: parseFloat(m.amount1),
      //   }
      // })
      accum = [...accum, ...mintEntries, ...burnEntries]
      return accum
    }, [])
    console.log('FORMATTED DATA IN TXN ====', formatted)
    return formatted
  } catch {
    return undefined
  }
}

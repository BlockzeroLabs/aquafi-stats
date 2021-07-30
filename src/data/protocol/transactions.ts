import { client, v2client } from 'apollo/client'
import gql from 'graphql-tag'
import { Transaction, V2Transaction, TransactionType } from 'types'
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
        staker
        unstakeTime
      }
    }
  }
`
const V2_GLOBAL_TRANSACTIONS = gql`
  query transactions {
    transactions {
      stakes {
        id
        pool {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }

        staker
        stakeTime
      }
      unstakes {
        id
        pool {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
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
    staker: string
    unstakeTime: string
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

type V2TransactionEntry = {
  timestamp: string
  id: string
  stakes: {
    id: string
    pool: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }
    // tokenId: string
    // totalValueLocked: string
    staker: string
    stakeTime: string
  }[]
  unstakes: {
    id: string

    pool: {
      token0: {
        id: string
        symbol: string
      }
      token1: {
        id: string
        symbol: string
      }
    }

    // tokenId: string
    // totalValueLocked: string
    staker: string
    unstakeTime: string
  }[]
}

interface TransactionResults {
  transactions: TransactionEntry[]
}
interface V2TransactionResults {
  transactions: V2TransactionEntry[]
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
      // console.log('FORMATTED DATA IN fffffffffffffffffTXN ====')

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

          timestamp: m.unstakeTime,

          pool: {
            feeTier: m.pool.feeTier,
            token0: {
              id: m.pool.token0.id,

              symbol: m.pool.token0.symbol,
            },
            token1: {
              id: m.pool.token1.id,
              // staker: m.staker,

              symbol: m.pool.token1.symbol,
            },
          },
          tokenId: m.tokenId,
          totalValueLocked: m.totalValueLocked,
          staker: m.staker,

          stakeTime: m.unstakeTime,
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
    // console.log('FORMATTED DATA IN TXN ====', formatted)
    return formatted
  } catch {
    return undefined
  }
}

export async function fetchV2TopTransactions(): Promise<V2Transaction[] | undefined> {
  try {
    const { data, error, loading } = await v2client.query<V2TransactionResults>({
      query: V2_GLOBAL_TRANSACTIONS,
      fetchPolicy: 'network-only',
    })

    if (error || loading || !data) {
      return undefined
    }
    console.log('PT TXN DATA v22222=====', data)
    // is jagah s start karo//////////////////////////
    const formatted = data.transactions.reduce((accum: V2Transaction[], t: V2TransactionEntry) => {
      console.log('ttttttttttttttttttttt', t)

      const mintEntries = t.stakes.map((m) => {
        return {
          type: TransactionType.MINT,
          hash: m.id,
          timestamp: m.stakeTime,

          pool: {
            token0: {
              id: m.pool.token0.id,

              symbol: m.pool.token0.symbol,
            },
            token1: {
              id: m.pool.token1.id,

              symbol: m.pool.token1.symbol,
            },
          },
          // tokenId: m.tokenId,
          // totalValueLocked: m.totalValueLocked,
          staker: m.staker,
          stakeTime: m.stakeTime,
        }
      })
      const burnEntries = t.unstakes.map((m) => {
        return {
          type: TransactionType.BURN,
          hash: m.id,

          timestamp: m.unstakeTime,

          pool: {
            token0: {
              id: m.pool.token0.id,

              symbol: m.pool.token0.symbol,
            },
            token1: {
              id: m.pool.token1.id,
              // staker: m.staker,

              symbol: m.pool.token1.symbol,
            },
          },
          // tokenId: m.tokenId,
          // totalValueLocked: m.totalValueLocked,
          staker: m.staker,

          stakeTime: m.unstakeTime,
        }
      })

      accum = [...accum, ...mintEntries, ...burnEntries]
      return accum
    }, [])
    // console.log('FORMATTED DATA IN TXN ====', formatted)
    return formatted
  } catch {
    return undefined
  }
}

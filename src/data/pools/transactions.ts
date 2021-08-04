import { client, v2client, sushiClient } from 'apollo/client'
import gql from 'graphql-tag'
import { Transaction, V2Transaction, TransactionType } from 'types'
import { formatTokenSymbol } from 'utils/tokens'
import { useChangeProtocol } from 'state/user/hooks'

const POOL_TRANSACTIONS = gql`
  query transactions($address: Bytes!) {
    stakes(orderBy: stakeTime, orderDirection: desc, where: { pool: $address }) {
      id

      pool {
        feeTier
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      tokenId
      totalValueLocked
      staker
      stakeTime
    }
    unstakes(orderBy: unstakeTime, orderDirection: desc, where: { pool: $address }) {
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
`
const V2POOL_TRANSACTIONS = gql`
  query transactions($address: Bytes!) {
    stakes(orderBy: stakeTime, orderDirection: desc, where: { pool: $address }) {
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
    unstakes(orderBy: unstakeTime, orderDirection: desc, where: { pool: $address }) {
      id
      pool {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }

      staker
      unstakeTime
    }
  }
`

interface TransactionResults {
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
  //   timestamp: string
  //   transaction: {
  //     id: string
  //   }
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
  //   amount0: string
  //   amount1: string
  //   amountUSD: string
  // }[]
}
interface V2TransactionResults {
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
    tokenId: string
    totalValueLocked: string
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

    tokenId: string
    totalValueLocked: string
    staker: string
    unstakeTime: string
  }[]
  // burns: {
  //   timestamp: string
  //   transaction: {
  //     id: string
  //   }
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
  //   amount0: string
  //   amount1: string
  //   amountUSD: string
  // }[]
}

export async function fetchPoolTransactions(
  address: string
): Promise<{ data: Transaction[] | undefined; error: boolean; loading: boolean }> {
  const { data, error, loading } = await client.query<TransactionResults>({
    query: POOL_TRANSACTIONS,
    variables: {
      address: address,
    },
    fetchPolicy: 'cache-first',
  })
  console.log('TXN DATA========', data, error)

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

  const mints = data?.stakes.map((m) => {
    return {
      type: TransactionType.MINT,
      hash: m.id,
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
  const burns = data?.unstakes.map((m) => {
    return {
      type: TransactionType.BURN,

      hash: m.id,
      timestamp: m.unstakeTime,

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

      stakeTime: m.unstakeTime,
    }
  })

  // const swaps = data?.swaps.map((m) => {
  //   return {
  //     type: TransactionType.SWAP,
  //     hash: m.transaction.id,
  //     timestamp: m.timestamp,
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
  // console.log('MINTS DATA=============', mints, burns)

  return { data: [...mints, ...burns], error: false, loading: false }
}
export async function fetchV2PoolTransactions(
  address: string,
  protocol: string
): Promise<{ data: V2Transaction[] | undefined; error: boolean; loading: boolean }> {
  const clientl = protocol == 'v2' ? v2client : sushiClient

  const { data, error, loading } = await clientl.query<V2TransactionResults>({
    query: V2POOL_TRANSACTIONS,
    variables: {
      address: address,
    },
    fetchPolicy: 'cache-first',
  })
  console.log('TXN DATA v2========', data, error, loading)

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

  const mints = data?.stakes?.map((m) => {
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
      tokenId: m.tokenId,
      totalValueLocked: m.totalValueLocked,
      staker: m.staker,
      stakeTime: m.stakeTime,
    }
  })
  const burns = data?.unstakes?.map((m) => {
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
          symbol: m.pool.token1.symbol,
        },
      },
      tokenId: m.tokenId,
      totalValueLocked: m.totalValueLocked,
      staker: m.staker,

      stakeTime: m.unstakeTime,
    }
  })

  // const swaps = data?.swaps.map((m) => {
  //   return {
  //     type: TransactionType.SWAP,
  //     hash: m.transaction.id,
  //     timestamp: m.timestamp,
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
  // console.log('MINTS DATA=============', mints, burns)

  return { data: [...mints, ...burns], error: false, loading: false }
}

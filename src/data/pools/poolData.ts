import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { PoolData } from 'state/pools/reducer'
import { get2DayChange } from 'utils/data'
import { formatTokenName, formatTokenSymbol } from 'utils/tokens'
import { useClients } from 'state/application/hooks'
import { useEffect } from 'react'

export const POOLS_BULK = (block: number | undefined, pools: string[]) => {
  let poolString = `[`
  pools.map((address) => {
    return (poolString += `"${address}",`)
  })
  poolString += ']'
  const queryString =
    `
    query pools {
      pools(where: {id_in: ${poolString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    ` orderBy: totalValueLockedDrivedUSD, orderDirection: desc, subgraphError: allow) {
        id
        aquaPremium
        token0 {
            id
            symbol 
            name
            decimals
            drivedETH
            drivedUSD
        }
        token1 {
            id
            symbol 
            name
            decimals
            drivedETH
            drivedUSD
        }
        feeTier
        reserve0
        reserve1
        reserve0Staked
        reserve1Staked
        aquaPremiumAmount
        aquaPremiumAmountDrivedUSD
        aquaAmount
        aquaAmountDrivedUSD
        totalValueLockedDrivedUSD
        stakeCount
        activeStakeCount
        unstakeCount
      }
    }
    `
  return gql(queryString)
}

interface PoolFields {
  id: string
  aquaPremium: string
  token0: {
    id: string
    symbol: string
    name: string
    decimals: string
    drivedETH: string
    drivedUSD: string
  }
  token1: {
    id: string
    symbol: string
    name: string
    decimals: string
    drivedETH: string
    drivedUSD: string
  }
  feeTier: string
  reserve0: string
  reserve1: string
  reserve0Staked: string
  reserve1Staked: string
  aquaPremiumAmount: string
  aquaPremiumAmountDrivedUSD: string
  aquaAmount: string
  aquaAmountDrivedUSD: string
  totalValueLockedDrivedUSD: string
  stakeCount: string
  activeStakeCount: string
  unstakeCount: string
}

interface PoolDataResponse {
  pools: PoolFields[]
}

/**
 * Fetch top addresses by volume
 */
export function usePoolDatas(
  poolAddresses: string[]
): {
  loading: boolean
  error: boolean
  data:
    | {
        [address: string]: PoolData
      }
    | undefined
} {
  // get client
  const { dataClient } = useClients()

  // get blocks from historic timestamps
  const [t24, t48] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48])
  const [block24] = blocks ?? []

  const { loading, error, data } = useQuery<PoolDataResponse>(POOLS_BULK(undefined, poolAddresses), {
    client: dataClient,
  })

  const { loading: loading24, error: error24, data: data24 } = useQuery<PoolDataResponse>(
    POOLS_BULK(block24?.number, poolAddresses),
    { client: dataClient }
  )
  // const { loading: loading48, error: error48, data: data48 } = useQuery<PoolDataResponse>(
  //   POOLS_BULK(block48?.number, poolAddresses),
  //   { client: dataClient }
  // )
  // const { loading: loadingWeek, error: errorWeek, data: dataWeek } = useQuery<PoolDataResponse>(
  //   POOLS_BULK(blockWeek?.number, poolAddresses),
  //   { client: dataClient }
  // )

  const anyError = Boolean(error || error24 || blockError)
  const anyLoading = Boolean(loading || loading24)

  // return early if not all data yet
  if (anyError || anyLoading) {
    return {
      loading: anyLoading,
      error: anyError,
      data: undefined,
    }
  }

  const parsed = data?.pools
    ? data.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed24 = data24?.pools
    ? data24.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  // const parsed48 = data48?.pools
  //   ? data48.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
  //       accum[poolData.id] = poolData
  //       return accum
  //     }, {})
  //   : {}
  // const parsedWeek = dataWeek?.pools
  //   ? dataWeek.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
  //       accum[poolData.id] = poolData
  //       return accum
  //     }, {})
  //   : {}

  // format data and calculate daily changes
  const formatted = poolAddresses.reduce((accum: { [address: string]: PoolData }, address) => {
    const current: PoolFields | undefined = parsed[address]
    const oneDay: PoolFields | undefined = parsed24[address]
    // const twoDay: PoolFields | undefined = parsed48[address]
    // const week: PoolFields | undefined = parsedWeek[address]

    const totalValueLockedDrivedUSDChange =
      current && oneDay
        ? parseFloat(current.totalValueLockedDrivedUSD) - parseFloat(oneDay.totalValueLockedDrivedUSD)
        : current
        ? parseFloat(current.totalValueLockedDrivedUSD)
        : 0

    const aquaPremiumAmountDrivedUSDChange =
      current && oneDay
        ? parseFloat(current.aquaPremiumAmountDrivedUSD) - parseFloat(oneDay.aquaPremiumAmountDrivedUSD)
        : current
        ? parseFloat(current.aquaPremiumAmountDrivedUSD)
        : 0

    const aquaAmountDrivedUSDChange =
      current && oneDay
        ? parseFloat(current.aquaAmountDrivedUSD) - parseFloat(oneDay.aquaAmountDrivedUSD)
        : current
        ? parseFloat(current.aquaAmountDrivedUSD)
        : 0

    const activeStakeCountChange =
      current && oneDay
        ? parseFloat(current.activeStakeCount) - parseFloat(oneDay.activeStakeCount)
        : current
        ? parseFloat(current.activeStakeCount)
        : 0

    if (current) {
      accum[address] = {
        address: current.id,
        aquaPremium: parseFloat(current.aquaPremium) / 100,
        token0: {
          address: current.token0.id,
          name: formatTokenName(current.token0.id, current.token0.name),
          symbol: formatTokenSymbol(current.token0.id, current.token0.symbol),
          decimals: parseInt(current.token0.decimals),
          drivedETH: parseFloat(current.token0.drivedETH),
          drivedUSD: parseFloat(current.token0.drivedUSD),
        },
        token1: {
          address: current.token1.id,
          name: formatTokenName(current.token1.id, current.token1.name),
          symbol: formatTokenSymbol(current.token1.id, current.token1.symbol),
          decimals: parseInt(current.token1.decimals),
          drivedETH: parseFloat(current.token1.drivedETH),
          drivedUSD: parseFloat(current.token1.drivedUSD),
        },
        reserve0: parseFloat(current.reserve0),
        reserve1: parseFloat(current.reserve1),

        reserve0Staked: parseFloat(current.reserve0Staked),
        reserve1Staked: parseFloat(current.reserve1Staked),

        totalValueLockedDrivedUSD: parseFloat(current.totalValueLockedDrivedUSD),
        totalValueLockedDrivedUSDChange: totalValueLockedDrivedUSDChange,

        aquaPremiumAmount: parseFloat(current.aquaPremiumAmount),
        aquaPremiumAmountDrivedUSD: parseFloat(current.aquaPremiumAmountDrivedUSD),
        aquaPremiumAmountDrivedUSDChange: aquaPremiumAmountDrivedUSDChange,

        aquaAmount: parseFloat(current.aquaAmount),
        aquaAmountDrivedUSD: parseFloat(current.aquaAmountDrivedUSD),
        aquaAmountDrivedUSDChange: aquaAmountDrivedUSDChange,

        stakeCount: parseFloat(current.stakeCount),
        activeStakeCount: parseFloat(current.activeStakeCount),
        activeStakeCountChange: activeStakeCountChange,
        unstakeCount: parseFloat(current.unstakeCount),

        // temporary
        feeTier: parseInt(current.feeTier),
        token0Price: 0,
        token1Price: 0,
        volumeUSD: 0,
        volumeUSDChange: 0,
        tvlUSD: 0,
      }
    }

    return accum
  }, {})

  return {
    loading: anyLoading,
    error: anyError,
    data: formatted,
  }
}

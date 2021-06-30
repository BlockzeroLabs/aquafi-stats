import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { PoolData } from 'state/pools/reducer'
import { get2DayChange } from 'utils/data'
import { formatTokenName, formatTokenSymbol } from 'utils/tokens'
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
      whitelistedPools(where: {id_in: ${poolString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    ` orderBy: totalValueLocked, orderDirection: desc) {
      id
    createdAtTimestamp
    createdAtBlockNumber
      token0 {
        id
        name
        decimals
        symbol
      }
      token1 {
        id
        name
        decimals
        symbol
      }
      feeTier
    aquaPremium
    token0Price
    token1Price
      totalValueLockedToken0
    totalValueLockedToken1
      totalValueLocked
    aquaPremiumCollected
      aquaPremiumCollectedUSD
    stakeCount
    unstakeCount
    }
    }
    `
  return gql(queryString)
}

interface PoolFields {
  id: string
  createdAtTimestamp: string

  token0: {
    id: string
    symbol: string
    name: string
    decimals: string
  }
  token1: {
    id: string
    symbol: string
    name: string
    decimals: string
  }
  feeTier: string
  token0Price: string
  token1Price: string
  aquaPremium: string

  totalValueLockedToken0: string
  totalValueLockedToken1: string
  totalValueLocked: string
  aquaPremiumCollected: string
  aquaPremiumCollectedUSD: string
  stakeCount: string
  unstakeCount: string
}

interface PoolDataResponse {
  whitelistedPools: PoolFields[]
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
  // get blocks from historic timestamps
  const [t24, t48, tWeek] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek])
  const [block24, block48, blockWeek] = blocks ?? []

  const { loading, error, data } = useQuery<PoolDataResponse>(POOLS_BULK(undefined, poolAddresses))

  const { loading: loading24, error: error24, data: data24 } = useQuery<PoolDataResponse>(
    POOLS_BULK(block24?.number, poolAddresses)
  )

  useEffect(() => {
    console.log('data24=======', data24, error24)
  }, [data24, error24])

  const { loading: loading48, error: error48, data: data48 } = useQuery<PoolDataResponse>(
    POOLS_BULK(block48?.number, poolAddresses)
  )
  const { loading: loadingWeek, error: errorWeek, data: dataWeek } = useQuery<PoolDataResponse>(
    POOLS_BULK(blockWeek?.number, poolAddresses)
  )

  const anyError = Boolean(error || error24 || error48 || blockError || errorWeek)
  const anyLoading = Boolean(loading || loading24 || loading48 || loadingWeek)

  // return early if not all data yet
  if (anyError || anyLoading) {
    return {
      loading: anyLoading,
      error: anyError,
      data: undefined,
    }
  }

  const parsed = data?.whitelistedPools
    ? data.whitelistedPools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed24 = data24?.whitelistedPools
    ? data24.whitelistedPools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed48 = data48?.whitelistedPools
    ? data48.whitelistedPools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsedWeek = dataWeek?.whitelistedPools
    ? dataWeek.whitelistedPools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}

  // format data and calculate daily changes
  const formatted = poolAddresses.reduce((accum: { [address: string]: PoolData }, address) => {
    const current: PoolFields | undefined = parsed[address]
    const oneDay: PoolFields | undefined = parsed24[address]
    const twoDay: PoolFields | undefined = parsed48[address]
    const week: PoolFields | undefined = parsedWeek[address]

    // const [volumeUSD, volumeUSDChange] =
    //   current && oneDay && twoDay
    //     ? get2DayChange(current.volumeUSD, oneDay.volumeUSD, twoDay.volumeUSD)
    //     : current
    //     ? [parseFloat(current.volumeUSD), 0]
    //     : [0, 0]

    // const volumeUSDWeek =
    //   current && week
    //     ? parseFloat(current.volumeUSD) - parseFloat(week.volumeUSD)
    //     : current
    //     ? parseFloat(current.volumeUSD)
    //     : 0

    const tvlUSD = current ? parseFloat(current.totalValueLocked) : 0

    const tvlUSDChange =
      current && oneDay
        ? ((parseFloat(current.totalValueLocked) - parseFloat(oneDay.totalValueLocked)) /
            parseFloat(oneDay.totalValueLocked)) *
          100
        : 0

    const tvlToken0 = current ? parseFloat(current.totalValueLockedToken0) : 0
    const tvlToken1 = current ? parseFloat(current.totalValueLockedToken1) : 0

    const feeTier = current ? current.feeTier : '0'

    if (current) {
      accum[address] = {
        id: address,
        createdAtTimestamp: current.createdAtTimestamp,

        feeTier,
        token0: {
          id: current.token0.id,
          name: formatTokenName(current.token0.id, current.token0.name),
          symbol: formatTokenSymbol(current.token0.id, current.token0.symbol),
          decimals: current.token0.decimals,
        },
        token1: {
          id: current.token1.id,
          name: formatTokenName(current.token1.id, current.token1.name),
          symbol: formatTokenSymbol(current.token1.id, current.token1.symbol),
          decimals: current.token1.decimals,
        },
        token0Price: current.token0Price,
        token1Price: current.token1Price,

        aquaPremium: current.aquaPremium,

        totalValueLockedToken0: current.totalValueLockedToken0,
        totalValueLockedToken1: current.totalValueLockedToken1,
        totalValueLocked: current.totalValueLocked,
        aquaPremiumCollected: current.aquaPremiumCollected,
        aquaPremiumCollectedUSD: current.aquaPremiumCollectedUSD,
        stakeCount: current.stakeCount,
        unstakeCount: current.unstakeCount,
        // tvlUSD,
        // tvlUSDChange,
        // tvlToken0,
        // tvlToken1,
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

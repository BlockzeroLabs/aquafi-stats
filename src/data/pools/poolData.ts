import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { PoolData } from 'state/pools/reducer'
import { get2DayChange } from 'utils/data'
import { formatTokenName, formatTokenSymbol } from 'utils/tokens'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'
import { useEffect } from 'react'
import { uniswapV2MainClient } from 'apollo/client'
import { SupportedNetwork } from 'constants/networks'

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

export const PAIRS_BULK_VOLUME = (block: number | undefined, pools: string[], isPair: boolean) => {
  let poolString = `[`
  pools.map((address) => {
    return (poolString += `"${address}",`)
  })
  poolString += ']'
  const pairsQueryString =
    `
    query pairs {
      pairs(where: {id_in: ${poolString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    `) {
        id
        volumeUSD
      }
    }
    `
  const poolsQueryString =
    `
    query pools {
      pools(where: {id_in: ${poolString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    `) {
        id
        volumeUSD
      }
    }
    `
  return gql(isPair ? pairsQueryString : poolsQueryString)
}

interface PairsVolumeField {
  id: string
  volumeUSD: string
}

interface PairsVolumeResponse {
  pairs: PairsVolumeField[]
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
  const { dataClient, volumeClient } = useClients()
  const [activeNetwork] = useActiveNetworkVersion()
  const isPair = activeNetwork.id === SupportedNetwork.UNISWAP_V3 ? false : true

  // get blocks from historic timestamps
  const [t24, t48] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48])
  const [block24] = blocks ?? []

  const { loading, error, data } = useQuery<PoolDataResponse>(POOLS_BULK(undefined, poolAddresses), {
    client: dataClient,
  })

  const { loading: loadingVolume, error: errorVolume, data: dataVolume } = useQuery<PairsVolumeResponse>(
    PAIRS_BULK_VOLUME(undefined, poolAddresses, isPair),
    {
      client: volumeClient,
    }
  )

  const { loading: loading24, error: error24, data: data24 } = useQuery<PoolDataResponse>(
    POOLS_BULK(block24?.number, poolAddresses),
    { client: dataClient }
  )

  const { loading: loadingVolume24, error: errorVolume24, data: dataVolume24 } = useQuery<PairsVolumeResponse>(
    PAIRS_BULK_VOLUME(block24?.number, poolAddresses, isPair),
    {
      client: volumeClient,
    }
  )

  useEffect(() => {
    console.log('DATA_VOLUME', dataVolume, dataVolume24)
  }, [dataVolume, dataVolume24])

  // const { loading: loading48, error: error48, data: data48 } = useQuery<PoolDataResponse>(
  //   POOLS_BULK(block48?.number, poolAddresses),
  //   { client: dataClient }
  // )
  // const { loading: loadingWeek, error: errorWeek, data: dataWeek } = useQuery<PoolDataResponse>(
  //   POOLS_BULK(blockWeek?.number, poolAddresses),
  //   { client: dataClient }
  // )

  // const anyError = Boolean(error || error24 || blockError)
  // const anyLoading = Boolean(loading || loading24)

  const anyError = Boolean(error || errorVolume || error24 || errorVolume24 || blockError)
  const anyLoading = Boolean(loading || loadingVolume || loading24 || loadingVolume24)

  useEffect(() => {
    console.log('ANY_ERROR', error, errorVolume, error24, errorVolume24, blockError)
  }),
    [error, errorVolume, error24, errorVolume24, blockError]

  useEffect(() => {
    console.log('ANY_LOADING', loading, loadingVolume, loading24, loadingVolume24)
  }),
    [loading, loadingVolume, loading24, loadingVolume24]

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
  const parsedVolume = dataVolume?.pairs
    ? dataVolume.pairs.reduce((accum: { [address: string]: PairsVolumeField }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsedVolume24 = dataVolume24?.pairs
    ? dataVolume24.pairs.reduce((accum: { [address: string]: PairsVolumeField }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}

  console.log('DATA_VOLUME_PARSED', parsedVolume, parsedVolume24)

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
    const currentVolume: PairsVolumeField | undefined = parsedVolume[address]
    const oneDayVolume: PairsVolumeField | undefined = parsedVolume24[address]
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

    const volumeUSDChange =
      currentVolume && oneDayVolume
        ? parseFloat(currentVolume.volumeUSD) - parseFloat(oneDayVolume.volumeUSD)
        : currentVolume
        ? parseFloat(currentVolume.volumeUSD)
        : 0

    if (current && currentVolume) {
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
        volumeUSD: parseInt(currentVolume.volumeUSD),
        volumeUSDChange: volumeUSDChange,
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

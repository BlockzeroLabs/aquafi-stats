import { getPercentChange } from '../../utils/data'
import { ProtocolData } from '../../state/protocol/reducer'
import gql from 'graphql-tag'
import { useQuery, ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { useEffect, useMemo } from 'react'
import { useClients } from 'state/application/hooks'
import { rinkebyBlockClient, mainnetBlockClient, uniswapV2Client, uniswapV3Client, suhiswapClient } from 'apollo/client'
import { CONTRACT_ADDRESSES } from './../../constants/contracts'

export const GLOBAL_DATA = (block?: string) => {
  const queryString = ` query aquaFiQueries {
      aquaFis(
       ${block ? `block: { number: ${block}}` : ``} 
       first: 1, subgraphError: allow) {
        totalValueLockedDrivedUSD
        activeTotalValueLockedDrivedUSD
    
        aquaPremiumAmount
        aquaPremiumAmountDrivedUSD
    
        aquaAmount
        aquaAmountDrivedUSD
    
        stakeCount
        unstakeCount
        activeStakeCount
      }
    }`
  return gql(queryString)
}

interface GlobalResponse {
  aquaFis: {
    totalValueLockedDrivedUSD: string
    activeTotalValueLockedDrivedUSD: string

    aquaPremiumAmount: string
    aquaPremiumAmountDrivedUSD: string

    aquaAmount: string
    aquaAmountDrivedUSD: string

    stakeCount: string
    unstakeCount: string
    activeStakeCount: string
  }[]
}

export function useFetchProtocolData(
  dataClientOverride?: ApolloClient<NormalizedCacheObject>,
  blockClientOverride?: ApolloClient<NormalizedCacheObject>
): {
  loading: boolean
  error: boolean
  data: ProtocolData | undefined
} {
  // get appropriate clients if override needed
  const { dataClient, blockClient } = useClients()
  const activeDataClient = dataClientOverride ?? dataClient
  const activeBlockClient = blockClientOverride ?? blockClient

  // get blocks from historic timestamps
  const [t24, t48] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48], activeBlockClient)
  const [block24] = blocks ?? []

  // fetch all data
  const { loading, error, data } = useQuery<GlobalResponse>(GLOBAL_DATA(), { client: activeDataClient })

  const { loading: loading24, error: error24, data: data24 } = useQuery<GlobalResponse>(
    GLOBAL_DATA(block24?.number ?? undefined),
    { client: activeDataClient }
  )

  const anyError = Boolean(error || error24 || blockError)
  const anyLoading = Boolean(loading || loading24)

  const parsed = data?.aquaFis?.[0]
  const parsed24 = data24?.aquaFis?.[0]

  const formattedData: ProtocolData | undefined = useMemo(() => {
    if (anyError || anyLoading || !parsed || !blocks) {
      return undefined
    }

    // volume data
    // const volumeUSD =
    //   parsed && parsed24
    //     ? parseFloat(parsed.totalValueLockedDrivedUSD) - parseFloat(parsed24.totalValueLockedDrivedUSD)
    //     : parseFloat(parsed.totalValueLockedDrivedUSD)

    // const volumeOneWindowAgo =
    //   parsed24 && parsed48
    //     ? parseFloat(parsed24.totalValueLockedDrivedUSD) - parseFloat(parsed48.totalValueLockedDrivedUSD)
    //     : undefined

    // const volumeUSDChange =
    //   volumeUSD && volumeOneWindowAgo ? ((volumeUSD - volumeOneWindowAgo) / volumeOneWindowAgo) * 100 : 0

    // total value locked
    const totalValueLockedDrivedUSDChange = getPercentChange(
      parsed?.totalValueLockedDrivedUSD,
      parsed24?.totalValueLockedDrivedUSD
    )

    // total value locked
    const activeTotalValueLockedDrivedUSDChange = getPercentChange(
      parsed?.activeTotalValueLockedDrivedUSD,
      parsed24?.activeTotalValueLockedDrivedUSD
    )

    // aqua premium amount
    const aquaPremiumAmountDrivedUSDChange = getPercentChange(
      parsed?.aquaPremiumAmountDrivedUSD,
      parsed24?.aquaPremiumAmountDrivedUSD
    )

    // aqua amount
    const aquaAmountDrivedUSDChange = getPercentChange(parsed?.aquaAmountDrivedUSD, parsed24?.aquaAmountDrivedUSD)

    // // stake transactions
    // const stakeCountChange = getPercentChange(parsed?.stakeCount, parsed24?.stakeCount)

    // // unstake transactions
    // const unstakeCountChange = getPercentChange(parsed?.unstakeCount, parsed24?.unstakeCount)

    // active stakes transactions
    const stakeCountChange = getPercentChange(parsed?.activeStakeCount, parsed24?.activeStakeCount)

    // 24H transactions
    // const txCount =
    //   parsed && parsed24
    //     ? parseFloat(parsed.stakeCount) - parseFloat(parsed24.stakeCount)
    //     : parseFloat(parsed.stakeCount)

    // const txCountOneWindowAgo =
    //   parsed24 && parsed48 ? parseFloat(parsed24.stakeCount) - parseFloat(parsed48.stakeCount) : undefined

    // const txCountChange =
    //   txCount && txCountOneWindowAgo ? getPercentChange(txCount.toString(), txCountOneWindowAgo.toString()) : 0

    // const feesOneWindowAgo =
    //   parsed24 && parsed48 ? parseFloat(parsed24.totalFeesUSD) - parseFloat(parsed48.totalFeesUSD) : undefined

    // const feesUSD =
    //   parsed && parsed24
    //     ? parseFloat(parsed.totalFeesUSD) - parseFloat(parsed24.totalFeesUSD)
    //     : parseFloat(parsed.totalFeesUSD)

    // const feeChange =
    //   feesUSD && feesOneWindowAgo ? getPercentChange(feesUSD.toString(), feesOneWindowAgo.toString()) : 0

    return {
      // total value locked
      totalValueLockedDrivedUSD: parseFloat(parsed?.totalValueLockedDrivedUSD),
      totalValueLockedDrivedUSDChange: totalValueLockedDrivedUSDChange,
      activeTotalValueLockedDrivedUSD: parseFloat(parsed?.activeTotalValueLockedDrivedUSD),
      activeTotalValueLockedDrivedUSDChange: activeTotalValueLockedDrivedUSDChange,

      // aqua premium
      aquaPremiumAmount: parseFloat(parsed?.aquaPremiumAmount),
      aquaPremiumAmountDrivedUSD: parseFloat(parsed?.aquaPremiumAmountDrivedUSD),
      aquaPremiumAmountDrivedUSDChange: aquaPremiumAmountDrivedUSDChange,

      // aqua amount
      aquaAmount: parseFloat(parsed?.aquaAmount),
      aquaAmountDrivedUSD: parseFloat(parsed?.aquaAmountDrivedUSD),
      aquaAmountDrivedUSDChange: aquaAmountDrivedUSDChange,

      // stakes
      stakeCount: parseFloat(parsed?.stakeCount),
      // stakeCountChange: stakeCountChange,

      unstakeCount: parseFloat(parsed?.unstakeCount),
      // unstakeCountChange: unstakeCountChange,

      activeStakeCount: parseFloat(parsed?.activeStakeCount),
      activeStakeCountChange: stakeCountChange,
    }
  }, [anyError, anyLoading, blocks, parsed, parsed24])

  return {
    loading: anyLoading,
    error: anyError,
    data: formattedData,
  }
}

export function useFetchAggregateProtocolData(): {
  loading: boolean
  error: boolean
  data: ProtocolData | undefined
} {
  const blockClient = process.env.REACT_APP_CHAIN_ID == '1' ? mainnetBlockClient : rinkebyBlockClient

  const { data: uniswapV2Data, loading: loadingUniswapV2, error: errorUniswapV2 } = useFetchProtocolData(
    uniswapV2Client,
    blockClient
  )
  const { data: uniswapV3Data, loading: loadingUniswapV3, error: errorUniswapV3 } = useFetchProtocolData(
    uniswapV3Client,
    blockClient
  )

  const { data: sushiswapData, loading: loadingSushiswap, error: errorSushiswap } = useFetchProtocolData(
    suhiswapClient,
    blockClient
  )

  if (!uniswapV2Data && !uniswapV3Data && !sushiswapData) {
    return {
      data: undefined,
      loading: false,
      error: false,
    }
  }

  // for now until useMultipleDatas hook just manuall construct ProtocolData object

  // console.log(ethereumData)
  // console.log(arbitrumData)

  return {
    data: undefined,
    loading: false,
    error: false,
  }
}

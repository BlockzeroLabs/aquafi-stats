import { getPercentChange } from '../../utils/data'
import { ProtocolData } from '../../state/protocol/reducer'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { useMemo } from 'react'

export const GLOBAL_DATA = (block?: string) => {
  const queryString = ` query uniswapFactories {
    aquaPrimaries(
       ${block ? `block: { number: ${block}}` : ``}
       first: 1) {
        id
        tvlUSD
        aquaPremium
  activeTvlUSD
  aquaPremiumUSD
  stakeCount
  activeStakeCount
  unstakeCount
      }
    }`
  return gql(queryString)
}

interface GlobalResponse {
  aquaPrimaries: {
    // id: string
    // aquaPremium: string
    tvlUSD: number
    activeTvlUSD: number
    aquaPremiumUSD: number
    tvlUSDChange: string
    aquaPremiumChange: string
    activeTvlUSDChange: string
    // stakeCount: string
    // activeStakeCount: string
    // unstakeCount: string
  }[]
}

// mocked
export function useFetchProtocolData(): {
  loading: boolean
  error: boolean
  data: ProtocolData | undefined
} {
  // get blocks from historic timestamps
  const [t24, t48] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48])
  const [block24, block48] = blocks ?? []

  // fetch all data
  const { loading, error, data } = useQuery<GlobalResponse>(GLOBAL_DATA())
  // console.log('OVERVIEW DATA', data, error)
  const { loading: loading24, error: error24, data: data24 } = useQuery<GlobalResponse>(
    GLOBAL_DATA(block24?.number ?? undefined)
  )
  const { loading: loading48, error: error48, data: data48 } = useQuery<GlobalResponse>(
    GLOBAL_DATA(block48?.number ?? undefined)
  )

  const anyError = Boolean(error || error24 || error48 || blockError)
  const anyLoading = Boolean(loading || loading24 || loading48)

  const parsed = data?.aquaPrimaries?.[0]
  const parsed24 = data24?.aquaPrimaries?.[0]
  const parsed48 = data48?.aquaPrimaries?.[0]
  console.log('parsed DATA', parsed, parsed24)

  const formattedData: ProtocolData | undefined = useMemo(() => {
    if (anyError || anyLoading || !parsed || !blocks) {
      return undefined
    }

    const tvlUSD = parsed && parsed24 ? parsed.tvlUSD - parsed24.tvlUSD : parsed.tvlUSD

    const aquaPremiumUSD = parsed && parsed24 ? parsed.aquaPremiumUSD - parsed24.aquaPremiumUSD : parsed.aquaPremiumUSD

    const activeTvlUSD = parsed && parsed24 ? parsed.activeTvlUSD - parsed24.activeTvlUSD : parsed.activeTvlUSD
    console.log('TYE OF PARSED', typeof parsed.tvlUSD)

    // volume data
    // const volumeUSD =
    //   parsed && parsed24 ? parseFloat(parsed.tvlUSD) - parseFloat(parsed24.tvlUSD) : parseFloat(parsed.tvlUSD)

    // const volumeOneWindowAgo =
    //   parsed24 && parsed48 ? parseFloat(parsed24.tvlUSD) - parseFloat(parsed48.tvlUSD) : undefined

    // const volumeUSDChange =
    //   volumeUSD && volumeOneWindowAgo ? ((volumeUSD - volumeOneWindowAgo) / volumeOneWindowAgo) * 100 : 0

    // // total value locked
    const tvlUSDChange = getPercentChange(parsed?.tvlUSD.toString(), parsed24?.tvlUSD.toString())
    const aquaPremiumChange = getPercentChange(parsed?.aquaPremiumUSD.toString(), parsed24?.aquaPremiumUSD.toString())
    const activeTvlUSDChange = getPercentChange(parsed?.activeTvlUSD.toString(), parsed24?.activeTvlUSD.toString())
    console.log('CHANGE===', tvlUSDChange, aquaPremiumChange, tvlUSD)
    // // 24H transactions
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

    return { aquaPremiumUSD, tvlUSD, activeTvlUSD, tvlUSDChange, aquaPremiumChange, activeTvlUSDChange }
    // volumeUSD,
    // volumeUSDChange: typeof volumeUSDChange === 'string' ? volumeUSDChange : 0,
    // tvlUSD: parseFloat(parsed.tvlUSD),
    // tvlUSDChange,
    // // feesUSD,
    // // feeChange,
    // txCount,
    // txCountChange,
  }, [anyError, anyLoading, blocks, parsed, parsed24, parsed48])

  return {
    loading: anyLoading,
    error: anyError,
    data: formattedData,
  }
}

import { updateProtocolData, updateChartData, updateTransactions } from './actions'
import { AppState, AppDispatch } from './../index'
import { ProtocolData } from './reducer'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChartDayData, Transaction } from 'types'

export function useProtocolData(): [ProtocolData | undefined, (protocolData: ProtocolData) => void] {
  const protocolData: ProtocolData | undefined = useSelector((state: AppState) => state.protocol.data)

  const dispatch = useDispatch<AppDispatch>()
  const setProtocolData: (protocolData: ProtocolData) => void = useCallback(
    (protocolData: ProtocolData) => dispatch(updateProtocolData({ protocolData })),
    [dispatch]
  )

  return [protocolData, setProtocolData]
}

export function useProtocolChartData(): [ChartDayData[] | undefined, (chartData: ChartDayData[]) => void] {
  const chartData: ChartDayData[] | undefined = useSelector((state: AppState) => state.protocol.chartData)
  const dispatch = useDispatch<AppDispatch>()
  const setChartData: (chartData: ChartDayData[]) => void = useCallback(
    (chartData: ChartDayData[]) => dispatch(updateChartData({ chartData })),
    [dispatch]
  )
  return [chartData, setChartData]
}

export function useProtocolTransactions(): [Transaction[] | undefined, (transactions: Transaction[]) => void] {
  const transactions: Transaction[] | undefined = useSelector((state: AppState) => state.protocol.transactions)
  const dispatch = useDispatch<AppDispatch>()
  const setTransactions: (transactions: Transaction[]) => void = useCallback(
    (transactions: Transaction[]) => dispatch(updateTransactions({ transactions })),
    [dispatch]
  )
  return [transactions, setTransactions]
}

// import { getPercentChange } from '../../utils/data'
// import { ProtocolData } from '../../state/protocol/reducer'
// import gql from 'graphql-tag'
// import { useQuery } from '@apollo/client'
// import { useDeltaTimestamps } from 'utils/queries'
// import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
// import { useMemo } from 'react'

// export const GLOBAL_DATA = (block?: string) => {
//   const queryString = ` query uniswapFactories {
//     aquaPrimaries(
//        ${block ? `block: { number: ${block}}` : ``}
//        first: 1) {
//         id
//         tvlUSD
//         aquaPremium
//   activeTvlUSD
//   aquaPremiumUSD
//   stakeCount
//   activeStakeCount
//   unstakeCount
//       }
//     }`
//   return gql(queryString)
// }

// interface GlobalResponse {
//   aquaPrimaries: {
//     id: string
//     tvlUSD: string
//     aquaPremium: string
//     activeTvlUSD: string
//     aquaPremiumUSD: string
//     stakeCount: string
//     activeStakeCount: string
//     unstakeCount: string
//   }[]
// }

// // mocked
// export function useFetchProtocolData(): {
//   loading: boolean
//   error: boolean
//   data: ProtocolData | undefined
// } {
//   // get blocks from historic timestamps
//   const [t24, t48] = useDeltaTimestamps()
//   const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48])
//   const [block24, block48] = blocks ?? []

//   // fetch all data
//   const { loading, error, data } = useQuery<GlobalResponse>(GLOBAL_DATA())
//   console.log('OVERVIEW DATA', data, error)
//   const { loading: loading24, error: error24, data: data24 } = useQuery<GlobalResponse>(
//     GLOBAL_DATA(block24?.number ?? undefined)
//   )
//   const { loading: loading48, error: error48, data: data48 } = useQuery<GlobalResponse>(
//     GLOBAL_DATA(block48?.number ?? undefined)
//   )

//   const anyError = Boolean(error || error24 || error48 || blockError)
//   const anyLoading = Boolean(loading || loading24 || loading48)

//   const parsed = data?.aquaPrimaries?.[0]
//   const parsed24 = data24?.aquaPrimaries?.[0]
//   const parsed48 = data48?.aquaPrimaries?.[0]
//   console.log('parsed DATA', parsed, parsed24)

//   const formattedData: ProtocolData | undefined = useMemo(() => {
//     if (anyError || anyLoading || !parsed || !blocks) {
//       return undefined
//     }

//     // volume data
//     const tvlUSD =
//       parsed && parsed24 ? parseFloat(parsed.tvlUSD) - parseFloat(parsed24.tvlUSD) : parseFloat(parsed.tvlUSD)

//     const aquaPremiumUSD =
//       parsed && parsed24
//         ? parseFloat(parsed.aquaPremiumUSD) - parseFloat(parsed24.aquaPremiumUSD)
//         : parseFloat(parsed.aquaPremiumUSD)

//     const activeTvlUSD =
//       parsed && parsed24
//         ? parseFloat(parsed.activeTvlUSD) - parseFloat(parsed24.activeTvlUSD)
//         : parseFloat(parsed.activeTvlUSD)

//     // const volumeOneWindowAgo =
//     //   parsed24 && parsed48 ? parseFloat(parsed24.totalVolumeUSD) - parseFloat(parsed48.totalVolumeUSD) : undefined

//     // const volumeUSDChange =
//     //   volumeUSD && volumeOneWindowAgo ? ((volumeUSD - volumeOneWindowAgo) / volumeOneWindowAgo) * 100 : 0

//     // // total value locked
//     // const tvlUSDChange = getPercentChange(parsed?.totalValueLockedUSD, parsed24?.totalValueLockedUSD)

//     // // 24H transactions
//     // const txCount =
//     //   parsed && parsed24 ? parseFloat(parsed.txCount) - parseFloat(parsed24.txCount) : parseFloat(parsed.txCount)

//     // const txCountOneWindowAgo =
//     //   parsed24 && parsed48 ? parseFloat(parsed24.txCount) - parseFloat(parsed48.txCount) : undefined

//     // const txCountChange =
//     //   txCount && txCountOneWindowAgo ? getPercentChange(txCount.toString(), txCountOneWindowAgo.toString()) : 0

//     // const feesOneWindowAgo =
//     //   parsed24 && parsed48 ? parseFloat(parsed24.totalFeesUSD) - parseFloat(parsed48.totalFeesUSD) : undefined

//     // const feesUSD =
//     //   parsed && parsed24
//     //     ? parseFloat(parsed.totalFeesUSD) - parseFloat(parsed24.totalFeesUSD)
//     //     : parseFloat(parsed.totalFeesUSD)

//     // const feeChange =
//     //   feesUSD && feesOneWindowAgo ? getPercentChange(feesUSD.toString(), feesOneWindowAgo.toString()) : 0

//     return
//     {
//       activeTvlUSD, feeChange
//     }
//   }, [anyError, anyLoading, blocks, parsed, parsed24, parsed48])

//   return {
//     loading: anyLoading,
//     error: anyError,
//     data: formattedData,
//   }
// }

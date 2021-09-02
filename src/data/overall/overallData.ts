import { useEffect, useMemo } from 'react'
import { ApolloClient, NormalizedCacheObject, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { useClients } from 'state/application/hooks'
import { GlobalData } from 'state/overall/reducer'
import { useDeltaTimestamps } from 'utils/queries'
import { suhiswapClient, uniswapV2Client, uniswapV3Client } from 'apollo/client'
import { useOverallData } from 'state/overall/hooks'
import { SupportedProtocol } from 'state/overall/actions'

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

export function useFetchClientData(
  dataClient?: ApolloClient<NormalizedCacheObject>
): { loading: boolean; error: boolean; data: GlobalData | undefined } {
  const { blockClient } = useClients()

  const activeDataClient = dataClient
  const activeBlockClient = blockClient

  // get blocks from historic timestamps
  const [t24, t48, tWeek] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek], activeBlockClient)
  const [block24, block48, blockWeek] = blocks ?? []

  // fetch all data
  const { loading, error, data } = useQuery<GlobalResponse>(GLOBAL_DATA(), { client: activeDataClient })

  const { loading: loading24, error: error24, data: data24 } = useQuery<GlobalResponse>(
    GLOBAL_DATA(block24?.number ?? undefined),
    { client: activeDataClient }
  )

  const { loading: loadingWeek, error: errorWeek, data: dataWeek } = useQuery<GlobalResponse>(
    GLOBAL_DATA(blockWeek?.number ?? undefined),
    { client: activeDataClient }
  )

  const anyError = Boolean(error || error24 || errorWeek || blockError)
  const anyLoading = Boolean(loading || loading24 || loadingWeek)

  const parsed = data?.aquaFis?.[0]
  const parsed24 = data24?.aquaFis?.[0]
  const parsedWeek = dataWeek?.aquaFis?.[0]

  const formattedData: GlobalData | undefined = useMemo(() => {
    if (anyError || anyLoading || !parsed || !blocks) {
      return undefined
    }

    return {
      totalValueLockedDrivedUSD: parseFloat(parsed.totalValueLockedDrivedUSD),
      activeTotalValueLockedDrivedUSD: parseFloat(parsed.activeTotalValueLockedDrivedUSD),

      aquaPremiumAmount: parseFloat(parsed.aquaPremiumAmount),
      aquaPremiumAmountDrivedUSD: parseFloat(parsed.aquaPremiumAmountDrivedUSD),

      aquaAmount: parseFloat(parsed.aquaAmount),
      aquaAmountDrivedUSD: parseFloat(parsed.aquaAmountDrivedUSD),

      stakeCount: parseInt(parsed.stakeCount),
      unstakeCount: parseInt(parsed.unstakeCount),
      activeStakeCount: parseInt(parsed.activeStakeCount),
    }
  }, [anyError, anyLoading, blocks, parsed, parsed24, parsedWeek])

  return { loading: anyLoading, error: anyError, data: formattedData }
}

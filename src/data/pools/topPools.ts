import { useMemo } from 'react'
import { useChangeProtocol } from 'state/user/hooks'
import { v2client, sushiClient, client } from './../../apollo/client'

import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'

export const TOP_POOLS = gql`
  query topPools {
    whitelistedPools(orderBy: totalValueLocked, orderDirection: desc) {
      id
    }
  }
`

interface TopPoolsResponse {
  whitelistedPools: {
    id: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useTopPoolAddresses(): {
  loading: boolean
  error: boolean
  addresses: string[] | undefined
} {
  const [protocol] = useChangeProtocol()

  const { loading, error, data } = useQuery<TopPoolsResponse>(
    TOP_POOLS,
    protocol == 'v2' ? { client: v2client } : protocol == 'sushi' ? { client: sushiClient } : { client: client }

    // fetchPolicy: 'network-only',
  )
  console.log('pool data=========', data, error)
  const formattedData = useMemo(() => {
    if (data) {
      return data.whitelistedPools.map((p) => p.id)
    } else {
      return undefined
    }
  }, [data])

  return {
    loading: loading,
    error: Boolean(error),
    addresses: formattedData,
  }
}

import { useMemo } from 'react'

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
  const { loading, error, data } = useQuery<TopPoolsResponse>(TOP_POOLS, {
    // client: aquaV3Client,
    fetchPolicy: 'network-only',
  })
  // console.log('data=========', data)
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

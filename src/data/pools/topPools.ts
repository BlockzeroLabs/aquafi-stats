import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'
import { SupportedNetwork } from 'constants/networks'
import { CONTRACT_ADDRESSES } from 'constants/contracts'

export const TOP_POOLS = gql`
  query topPools($address: String!) {
    pools(
      first: 50
      orderBy: totalValueLockedDrivedUSD
      orderDirection: desc
      subgraphError: allow
      where: { status: true, id_not: $address }
    ) {
      id
    }
  }
`

interface TopPoolsResponse {
  pools: {
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
  const { dataClient } = useClients()
  const [activeNetwork] = useActiveNetworkVersion()
  const { loading, error, data } = useQuery<TopPoolsResponse>(TOP_POOLS, {
    client: dataClient,
    variables: {
      address: activeNetwork.id == SupportedNetwork.UNISWAP_V2 ? '' : CONTRACT_ADDRESSES.AQUA_WETH_POOL_ADDRESS,
    },
    fetchPolicy: 'cache-first',
  })

  const formattedData = useMemo(() => {
    if (data) {
      return data.pools.map((p) => p.id)
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

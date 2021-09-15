import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { fetchChartData } from 'data/protocol/chart'
import { useEffect, useState } from 'react'
import { SupportedProtocol } from 'state/overall/actions'
import { ChartDayData } from 'types'

export function useFetchOverallChartData(
  dataClient: ApolloClient<NormalizedCacheObject>
): {
  error: boolean
  data: ChartDayData[] | undefined
} {
  // const [data, setData] = useState<{ [protocol: string]: ChartDayData[] | undefined }>()
  const [data, setData] = useState<ChartDayData[] | undefined>()
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { data, error } = await fetchChartData(dataClient)
      if (data && !error) {
        setData(data)
      } else if (error) {
        setError(true)
      }
    }
    if (!data && !error) {
      fetch()
    }
  }, [data, error, dataClient])

  return {
    error,
    data,
  }
}

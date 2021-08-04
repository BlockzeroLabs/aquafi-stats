import {
  useProtocolData,
  useV2ProtocolData,
  useProtocolChartData,
  useV2ProtocolChartData,
  useProtocolTransactions,
  useV2ProtocolTransactions,
} from './hooks'
import { useEffect } from 'react'
import { useFetchProtocolData } from 'data/protocol/overview'
import { useFetchGlobalChartData } from 'data/protocol/chart'
import { fetchTopTransactions, fetchV2TopTransactions } from 'data/protocol/transactions'
import { useChangeProtocol } from 'state/user/hooks'

export default function Updater(): null {
  const [protocolData, updateProtocolData] = useProtocolData()
  const [v2protocolData, updateV2ProtocolData] = useV2ProtocolData()
  const [protocol] = useChangeProtocol()

  const { data: fetchedProtocolData, error, loading } = useFetchProtocolData()

  const [chartData, updateChartData] = useProtocolChartData()
  const [v2chartData, updateV2ChartData] = useV2ProtocolChartData()

  const { data: fetchedChartData, error: chartError } = useFetchGlobalChartData()

  const [transactions, updateTransactions] = useProtocolTransactions()
  const [v2transactions, updateV2Transactions] = useV2ProtocolTransactions()

  // update overview data if available and not set
  useEffect(() => {
    if (protocolData === undefined && fetchedProtocolData && !loading && !error) {
      updateProtocolData(fetchedProtocolData)
    }
  }, [error, fetchedProtocolData, loading, protocolData, updateProtocolData])
  useEffect(() => {
    if (v2protocolData === undefined && fetchedProtocolData && !loading && !error) {
      updateV2ProtocolData(fetchedProtocolData)
    }
  }, [error, fetchedProtocolData, loading, v2protocolData, updateV2ProtocolData])

  // update global chart data if available and not set
  useEffect(() => {
    if (chartData === undefined && fetchedChartData && !chartError) {
      updateChartData(fetchedChartData)
    }
  }, [chartData, chartError, fetchedChartData, updateChartData])

  useEffect(() => {
    if (v2chartData === undefined && fetchedChartData && !chartError) {
      updateV2ChartData(fetchedChartData)
    }
  }, [v2chartData, chartError, fetchedChartData, updateV2ChartData])

  useEffect(() => {
    async function fetch() {
      const data = await fetchTopTransactions()
      if (data) {
        updateTransactions(data)
      }
    }
    if (!transactions) {
      fetch()
    }
  }, [transactions, updateTransactions])

  useEffect(() => {
    async function fetchV2() {
      const data = await fetchV2TopTransactions(protocol)
      if (data) {
        updateV2Transactions(data)
      }
    }
    if (!v2transactions) {
      fetchV2()
    }
  }, [v2transactions, updateV2Transactions])
  return null
}

// import {
//   useProtocolData,
//   useV2ProtocolData,
//   useProtocolChartData,
//   useV2ProtocolChartData,
//   useProtocolTransactions,
//   useV2ProtocolTransactions,
// } from './hooks'
// import { useEffect } from 'react'
// import { useFetchProtocolData } from 'data/protocol/overview'
// import { useFetchGlobalChartData } from 'data/protocol/chart'
// import { fetchTopTransactions } from 'data/protocol/transactions'

// export default function Updater(): null {
//   const [protocolData, updateProtocolData] = useProtocolData()
//   const [v2protocolData, updateV2ProtocolData] = useV2ProtocolData()

//   const { data: fetchedProtocolData, error, loading } = useFetchProtocolData()

//   const [chartData, updateChartData] = useProtocolChartData()
//   const [v2chartData, updateV2ChartData] = useV2ProtocolChartData()

//   const { data: fetchedChartData, error: chartError } = useFetchGlobalChartData()

//   const [transactions, updateTransactions] = useProtocolTransactions()
//   const [v2transactions, updateV2Transactions] = useV2ProtocolTransactions()
//   // update overview data if available and not set
//   useEffect(() => {
//     if (protocolData === undefined && fetchedProtocolData && !loading && !error) {
//       updateProtocolData(fetchedProtocolData)
//     }
//   }, [error, fetchedProtocolData, loading, protocolData, updateProtocolData])

//   useEffect(() => {
//     if (v2protocolData === undefined && fetchedProtocolData && !loading && !error) {
//       updateV2ProtocolData(fetchedProtocolData)
//     }
//   }, [error, fetchedProtocolData, loading, v2protocolData, updateV2ProtocolData])

//   // update global chart data if available and not set
//   useEffect(() => {
//     if (chartData === undefined && fetchedChartData && !chartError) {
//       updateChartData(fetchedChartData)
//     }
//   }, [chartData, chartError, fetchedChartData, updateChartData])
//   useEffect(() => {
//     if (chartData === undefined && fetchedChartData && !chartError) {
//       updateV2ChartData(fetchedChartData)
//     }
//   }, [chartData, chartError, fetchedChartData, updateV2ChartData])

//   useEffect(() => {
//     async function fetch() {
//       const data = await fetchTopTransactions()
//       if (data) {
//         updateTransactions(data)
//       }
//     }
//     if (!transactions) {
//       fetch()
//     }
//     async function fetchV2() {
//       const data = await fetchTopTransactions()
//       if (data) {
//         updateV2Transactions(data)
//       }
//     }
//     if (!v2transactions) {
//       fetchV2()
//     }
//   }, [v2transactions, updateV2Transactions])

//   return null
// }

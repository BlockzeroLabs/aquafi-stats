import { useEffect } from 'react'
import { uniswapV2Client, uniswapV3Client, suhiswapClient } from 'apollo/client'
import { useOverallData, useOverallChartData } from './hooks'
import { SupportedProtocol } from './actions'
import { useFetchProtocolData } from 'data/protocol/overview'
import { useFetchOverallChartData } from 'data/overall/chartdata'

export default function Updater(): null {
  const [data1, data2, data3, setProtocolData] = useOverallData()
  const { loading: loadingV2, error: errorV2, data: dataV2 } = useFetchProtocolData(uniswapV2Client)
  const { loading: loadingV3, error: errorV3, data: dataV3 } = useFetchProtocolData(uniswapV3Client)
  const { loading: loadingSushi, error: errorSushi, data: dataSushi } = useFetchProtocolData(suhiswapClient)

  const anyLoading = Boolean(loadingV2 || loadingV3 || loadingSushi)
  const anyError = Boolean(errorV2 || errorV3 || errorSushi)

  const [chart1, chart2, chart3, setChartData] = useOverallChartData()
  const { data: chartDataV2, error: errorChartV2 } = useFetchOverallChartData(uniswapV2Client)
  const { data: chartDataV3, error: errorChartV3 } = useFetchOverallChartData(uniswapV3Client)
  const { data: chartDataSushi, error: errorChartSushi } = useFetchOverallChartData(suhiswapClient)

  // Update each protocol chart data
  useEffect(() => {
    if (!chart1 && chartDataV2 && !errorChartV2) {
      setChartData(chartDataV2, SupportedProtocol.UNISWAP_V2)
    }
  }, [chart1, chartDataV2, errorChartV2])

  useEffect(() => {
    if (!chart2 && chartDataV3 && !errorChartV3) {
      setChartData(chartDataV3, SupportedProtocol.UNISWAP_V3)
    }
  }, [chart2, chartDataV3, errorChartV3])

  useEffect(() => {
    if (!chart3 && chartDataSushi && !errorChartSushi) {
      setChartData(chartDataSushi, SupportedProtocol.SUSHISWAP)
    }
  }, [chart3, chartDataSushi, errorChartSushi])

  // Update each protocol data
  useEffect(() => {
    if (!loadingV2 && !errorV2 && !data1 && dataV2) {
      setProtocolData(dataV2, SupportedProtocol.UNISWAP_V2)
    }
  }, [loadingV2, errorV2, dataV2, data1])

  useEffect(() => {
    if (!loadingV3 && !errorV3 && !data2 && dataV3) {
      setProtocolData(dataV3, SupportedProtocol.UNISWAP_V3)
    }
  }, [loadingV3, errorV3, dataV3, data2])

  useEffect(() => {
    if (!loadingSushi && !errorSushi && !data3 && dataSushi) {
      setProtocolData(dataSushi, SupportedProtocol.SUSHISWAP)
    }
  }, [loadingSushi, errorSushi, dataSushi, data3])

  return null
}

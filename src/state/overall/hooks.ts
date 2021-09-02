import { useDispatch, useSelector } from 'react-redux'
import { GlobalData } from './reducer'
import { AppDispatch, AppState } from './../index'
import { updateGlobalData, updateChartData } from './actions'
import { useCallback } from 'react'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { ChartDayData } from 'types'
import { ProtocolData } from 'state/protocol/reducer'

// export function useOverallData(): [
//   GlobalData | undefined,
//   GlobalData | undefined,
//   GlobalData | undefined,
//   (globalData: GlobalData, protocolId: number) => void
// ] {
//   const data1 = useSelector((state: AppState) => state.overall[0].data)
//   const data2 = useSelector((state: AppState) => state.overall[1].data)
//   const data3 = useSelector((state: AppState) => state.overall[2].data)
//   const dispatch = useDispatch<AppDispatch>()
//   const setProtocolData: (globalData: GlobalData, protocolId: number) => void = useCallback(
//     (globalData: GlobalData, protocolId: number) => dispatch(updateGlobalData({ globalData, protocolId })),
//     [dispatch]
//   )
//   return [data1, data2, data3, setProtocolData]
// }

export function useOverallData(): [
  ProtocolData | undefined,
  ProtocolData | undefined,
  ProtocolData | undefined,
  (globalData: ProtocolData, protocolId: number) => void
] {
  const data1 = useSelector((state: AppState) => state.overall[0].data)
  const data2 = useSelector((state: AppState) => state.overall[1].data)
  const data3 = useSelector((state: AppState) => state.overall[2].data)
  const dispatch = useDispatch<AppDispatch>()
  const setProtocolData: (globalData: ProtocolData, protocolId: number) => void = useCallback(
    (globalData: ProtocolData, protocolId: number) => dispatch(updateGlobalData({ globalData, protocolId })),
    [dispatch]
  )
  return [data1, data2, data3, setProtocolData]
}

export function useOverallChartData(): [
  ChartDayData[] | undefined,
  ChartDayData[] | undefined,
  ChartDayData[] | undefined,
  (chartData: ChartDayData[], protocolId: number) => void
] {
  const chartData1: ChartDayData[] | undefined = useSelector((state: AppState) => state.overall[0]?.chartData)
  const chartData2: ChartDayData[] | undefined = useSelector((state: AppState) => state.overall[1]?.chartData)
  const chartData3: ChartDayData[] | undefined = useSelector((state: AppState) => state.overall[2]?.chartData)

  const dispatch = useDispatch<AppDispatch>()
  const setChartData: (chartData: ChartDayData[], protocolId: number) => void = useCallback(
    (chartData: ChartDayData[], protocolId: number) => dispatch(updateChartData({ chartData, protocolId })),
    [dispatch]
  )
  return [chartData1, chartData2, chartData3, setChartData]
}

// export function useProtocolChartData(): [ChartDayData[] | undefined, (chartData: ChartDayData[]) => void] {
//   const [activeNetwork] = useActiveNetworkVersion()
//   const chartData: ChartDayData[] | undefined = useSelector(
//     (state: AppState) => state.protocol[activeNetwork.id]?.chartData
//   )

//   const dispatch = useDispatch<AppDispatch>()
//   const setChartData: (chartData: ChartDayData[]) => void = useCallback(
//     (chartData: ChartDayData[]) => dispatch(updateChartData({ chartData, networkId: activeNetwork.id })),
//     [activeNetwork.id, dispatch]
//   )
//   return [chartData, setChartData]
// }

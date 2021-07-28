import {
  updateProtocolData,
  updateV2ProtocolData,
  updateV2ChartData,
  updateChartData,
  updateTransactions,
  updateV2Transactions,
} from './actions'
import { AppState, AppDispatch } from './../index'
import { ProtocolData } from './reducer'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChartDayData, Transaction, V2Transaction } from 'types'

export function useProtocolData(): [ProtocolData | undefined, (protocolData: ProtocolData) => void] {
  const protocolData: ProtocolData | undefined = useSelector((state: AppState) => state.protocol.data)

  const dispatch = useDispatch<AppDispatch>()
  const setProtocolData: (protocolData: ProtocolData) => void = useCallback(
    (protocolData: ProtocolData) => dispatch(updateProtocolData({ protocolData })),
    [dispatch]
  )

  return [protocolData, setProtocolData]
}
export function useV2ProtocolData(): [ProtocolData | undefined, (protocolData: ProtocolData) => void] {
  const v2protocolData: ProtocolData | undefined = useSelector((state: AppState) => state.v2protocol.v2data)

  const dispatch = useDispatch<AppDispatch>()
  const setV2ProtocolData: (v2protocolData: ProtocolData) => void = useCallback(
    (v2protocolData: ProtocolData) => dispatch(updateV2ProtocolData({ v2protocolData })),
    [dispatch]
  )

  return [v2protocolData, setV2ProtocolData]
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
export function useV2ProtocolChartData(): [ChartDayData[] | undefined, (chartData: ChartDayData[]) => void] {
  const v2chartData: ChartDayData[] | undefined = useSelector((state: AppState) => state.v2protocol.v2chartData)
  const dispatch = useDispatch<AppDispatch>()
  const setV2ChartData: (v2chartData: ChartDayData[]) => void = useCallback(
    (v2chartData: ChartDayData[]) => dispatch(updateV2ChartData({ v2chartData })),
    [dispatch]
  )
  return [v2chartData, setV2ChartData]
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
export function useV2ProtocolTransactions(): [V2Transaction[] | undefined, (transactions: V2Transaction[]) => void] {
  const v2transactions: V2Transaction[] | undefined = useSelector((state: AppState) => state.v2protocol.v2transactions)
  const dispatch = useDispatch<AppDispatch>()
  const setV2Transactions: (v2transactions: V2Transaction[]) => void = useCallback(
    (v2transactions: V2Transaction[]) => dispatch(updateV2Transactions({ v2transactions })),
    [dispatch]
  )
  return [v2transactions, setV2Transactions]
}

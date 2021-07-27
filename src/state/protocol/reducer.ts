import { currentTimestamp } from './../../utils/index'
import {
  updateProtocolData,
  updateV2ProtocolData,
  updateChartData,
  updateV2ChartData,
  updateTransactions,
  updateV2Transactions,
} from './actions'
import { createReducer } from '@reduxjs/toolkit'
import { ChartDayData, Transaction, V2Transaction } from 'types'

export interface ProtocolData {
  // id: string
  // aquaPremium: string
  tvlUSD: number
  activeTvlUSD: number
  aquaPremiumUSD: number
  tvlUSDChange: number
  aquaPremiumChange: number
  activeTvlUSDChange: number

  // stakeCount: string
  // activeStakeCount: string
  // unstakeCount: string
}

export interface ProtocolState {
  // timestamp for last updated fetch
  readonly lastUpdated: number | undefined

  // overview data
  readonly data: ProtocolData | undefined

  readonly chartData: ChartDayData[] | undefined

  readonly transactions: Transaction[] | undefined
}
export interface V2ProtocolState {
  // timestamp for last updated fetch
  readonly lastUpdated: number | undefined

  // overview data
  readonly data: ProtocolData | undefined

  readonly chartData: ChartDayData[] | undefined

  readonly v2transactions: V2Transaction[] | undefined
}

export const initialState: ProtocolState = {
  data: undefined,
  chartData: undefined,
  transactions: undefined,
  lastUpdated: undefined,
}
export const V2initialState: V2ProtocolState = {
  data: undefined,
  chartData: undefined,
  v2transactions: undefined,
  lastUpdated: undefined,
}

export const protocol = createReducer(initialState, (builder) =>
  builder
    .addCase(updateProtocolData, (state, { payload: { protocolData } }) => {
      state.data = protocolData
      // mark when last updated
      state.lastUpdated = currentTimestamp()
    })
    .addCase(updateChartData, (state, { payload: { chartData } }) => {
      state.chartData = chartData
    })
    .addCase(updateTransactions, (state, { payload: { transactions } }) => {
      state.transactions = transactions
    })
)
export const v2protocol = createReducer(V2initialState, (builder) =>
  builder
    .addCase(updateV2ProtocolData, (state, { payload: { protocolData } }) => {
      state.data = protocolData
      // mark when last updated
      state.lastUpdated = currentTimestamp()
    })
    .addCase(updateV2ChartData, (state, { payload: { chartData } }) => {
      state.chartData = chartData
    })
    .addCase(updateV2Transactions, (state, { payload: { v2transactions } }) => {
      state.v2transactions = v2transactions
    })
)

import { currentTimestamp } from './../../utils/index'
import { updateProtocolData, updateChartData, updateTransactions } from './actions'
import { createReducer } from '@reduxjs/toolkit'
import { ChartDayData, Transaction } from 'types'
import { SupportedNetwork } from 'constants/networks'

export interface ProtocolData {
  // total value locked
  totalValueLockedDrivedUSD: number
  totalValueLockedDrivedUSDChange: number
  activeTotalValueLockedDrivedUSD: number
  activeTotalValueLockedDrivedUSDChange: number

  // aqua premium
  aquaPremiumAmount: number
  aquaPremiumAmountDrivedUSD: number
  aquaPremiumAmountDrivedUSDChange: number

  // aqua amount
  aquaAmount: number
  aquaAmountDrivedUSD: number
  aquaAmountDrivedUSDChange: number

  // stakes
  stakeCount: number
  // stakeCountChange: number
  unstakeCount: number
  // unstakeCountChange: number
  activeStakeCount: number
  activeStakeCountChange: number
}

export interface ProtocolState {
  [networkId: string]: {
    // timestamp for last updated fetch
    readonly lastUpdated: number | undefined
    // overview data
    readonly data: ProtocolData | undefined
    readonly chartData: ChartDayData[] | undefined
    readonly transactions: Transaction[] | undefined
  }
}

export const initialState: ProtocolState = {
  [SupportedNetwork.UNISWAP_V2]: {
    data: undefined,
    chartData: undefined,
    transactions: undefined,
    lastUpdated: undefined,
  },
  [SupportedNetwork.UNISWAP_V3]: {
    data: undefined,
    chartData: undefined,
    transactions: undefined,
    lastUpdated: undefined,
  },
  [SupportedNetwork.SUSHISWAP]: {
    data: undefined,
    chartData: undefined,
    transactions: undefined,
    lastUpdated: undefined,
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateProtocolData, (state, { payload: { protocolData, networkId } }) => {
      state[networkId].data = protocolData
      // mark when last updated
      state[networkId].lastUpdated = currentTimestamp()
    })
    .addCase(updateChartData, (state, { payload: { chartData, networkId } }) => {
      state[networkId].chartData = chartData
    })
    .addCase(updateTransactions, (state, { payload: { transactions, networkId } }) => {
      state[networkId].transactions = transactions
    })
)

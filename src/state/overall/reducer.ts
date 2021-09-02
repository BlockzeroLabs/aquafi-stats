import { createReducer } from '@reduxjs/toolkit'
import { ProtocolData } from 'state/protocol/reducer'
import { ChartDayData } from 'types'
import { SupportedProtocol, updateGlobalData, updateChartData } from './actions'

export interface GlobalData {
  totalValueLockedDrivedUSD: number
  activeTotalValueLockedDrivedUSD: number

  aquaPremiumAmount: number
  aquaPremiumAmountDrivedUSD: number

  aquaAmount: number
  aquaAmountDrivedUSD: number

  stakeCount: number
  unstakeCount: number
  activeStakeCount: number
}

export interface GlobalState {
  [protocolId: string]: {
    readonly data: ProtocolData | undefined
    readonly chartData: ChartDayData[] | undefined
  }
}

export const initialState: GlobalState = {
  [SupportedProtocol.UNISWAP_V2]: { data: undefined, chartData: undefined },
  [SupportedProtocol.UNISWAP_V3]: { data: undefined, chartData: undefined },
  [SupportedProtocol.SUSHISWAP]: { data: undefined, chartData: undefined },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateGlobalData, (state, { payload: { globalData, protocolId } }) => {
      state[protocolId].data = globalData
    })
    .addCase(updateChartData, (state, { payload: { chartData, protocolId } }) => {
      state[protocolId].chartData = chartData
    })
)

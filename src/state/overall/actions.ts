import { GlobalData } from './reducer'
import { createAction } from '@reduxjs/toolkit'
import { ChartDayData } from 'types'
import { ProtocolData } from 'state/protocol/reducer'

export enum SupportedProtocol {
  UNISWAP_V2,
  UNISWAP_V3,
  SUSHISWAP,
}

// protocol wide info
export const updateGlobalData = createAction<{ globalData: ProtocolData; protocolId: SupportedProtocol }>(
  'overall/updateGlobalData'
)

export const updateChartData = createAction<{ chartData: ChartDayData[]; protocolId: SupportedProtocol }>(
  'overall/updateChartData'
)

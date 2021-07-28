import { ProtocolData } from './reducer'
import { createAction } from '@reduxjs/toolkit'
import { ChartDayData, Transaction, V2Transaction } from 'types'

// protocol wide info
export const updateProtocolData = createAction<{ protocolData: ProtocolData }>('protocol/updateProtocolData')
export const updateV2ProtocolData = createAction<{ v2protocolData: ProtocolData }>('protocol/updateV2ProtocolData')
export const updateChartData = createAction<{ chartData: ChartDayData[] }>('protocol/updateChartData')
export const updateV2ChartData = createAction<{ v2chartData: ChartDayData[] }>('protocol/updateV2ChartData')
export const updateTransactions = createAction<{ transactions: Transaction[] }>('protocol/updateTransactions')
export const updateV2Transactions = createAction<{ v2transactions: V2Transaction[] }>('protocol/updateV2Transactions')

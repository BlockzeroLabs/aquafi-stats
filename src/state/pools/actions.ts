import { TickProcessed } from './../../data/pools/tickData'
import { createAction } from '@reduxjs/toolkit'
import { PoolData, V2PoolData, PoolChartEntry, V2PoolChartEntry } from './reducer'
import { Transaction, V2Transaction } from 'types'

// protocol wide infos
export const updatePoolData = createAction<{ pools: PoolData[] }>('pools/updatePoolData')
export const updateV2PoolData = createAction<{ pools: V2PoolData[] }>('pools/updateV2PoolData')

// add pool address to byAddress
export const addPoolKeys = createAction<{ poolAddresses: string[] }>('pool/addPoolKeys')

export const updatePoolChartData = createAction<{ poolAddress: string; chartData: PoolChartEntry[] }>(
  'pool/updatePoolChartData'
)
export const updateV2PoolChartData = createAction<{ poolAddress: string; v2chartData: V2PoolChartEntry[] }>(
  'pool/updateV2PoolChartData'
)

export const updatePoolTransactions = createAction<{ poolAddress: string; transactions: Transaction[] }>(
  'pool/updatePoolTransactions'
)
export const updateV2PoolTransactions = createAction<{ poolAddress: string; v2transactions: V2Transaction[] }>(
  'pool/updateV2PoolTransactions'
)

export const updateTickData = createAction<{
  poolAddress: string
  tickData:
    | {
        ticksProcessed: TickProcessed[]
        feeTier: string
        tickSpacing: number
        activeTickIdx: number
      }
    | undefined
}>('pool/updateTickData')
export const updateV2TickData = createAction<{
  poolAddress: string
  tickData:
    | {
        ticksProcessed: TickProcessed[]

        tickSpacing: number
        activeTickIdx: number
      }
    | undefined
}>('pool/updateV2TickData')

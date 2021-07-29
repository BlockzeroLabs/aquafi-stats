import { currentTimestamp } from './../../utils/index'
import {
  updatePoolData,
  updateV2PoolData,
  updateV2PoolChartData,
  addPoolKeys,
  updatePoolChartData,
  updatePoolTransactions,
  updateV2PoolTransactions,
  updateTickData,
  updateV2TickData,
} from './actions'
import { createReducer } from '@reduxjs/toolkit'
import { SerializedToken } from 'state/user/actions'
import { Transaction, V2Transaction } from 'types'
import { PoolTickData, V2PoolTickData } from 'data/pools/tickData'

export interface Pool {
  address: string
  token0: SerializedToken
  token1: SerializedToken
}

export declare enum FeeAmount {
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000,
}
export interface PoolData {
  id: string
  createdAtTimestamp: string

  token0: {
    id: string
    symbol: string
    name: string
    decimals: string
  }
  token1: {
    id: string
    symbol: string
    name: string
    decimals: string
  }
  feeTier: string
  // feeTier: FeeAmount
  token0Price: string
  token1Price: string
  aquaPremium: string

  totalValueLockedToken0: string
  totalValueLockedToken1: string
  totalValueLocked: string
  aquaPremiumCollected: string
  aquaPremiumCollectedUSD: string
  stakeCount: string
  unstakeCount: string
  // tvlUSD: number
  aquaPremiumCollectedUSDChange: number
  tvlUSDChange: number
}
export interface V2PoolData {
  id: string
  createdAtTimestamp: string

  token0: {
    id: string
    symbol: string
    name: string
    decimals: string
  }
  token1: {
    id: string
    symbol: string
    name: string
    decimals: string
  }

  token0Price: string
  token1Price: string
  aquaPremium: string

  totalValueLockedToken0: string
  totalValueLockedToken1: string
  totalValueLocked: string
  aquaPremiumCollected: string
  aquaPremiumCollectedUSD: string
  stakeCount: string
  unstakeCount: string
  // tvlUSD: number
  aquaPremiumCollectedUSDChange: number
  tvlUSDChange: number
}

export type PoolChartEntry = {
  date: number
  aquaPremiumUSD: number
  totalValueLockedUSD: number
}

export interface PoolsState {
  // analytics data from
  byAddress: {
    [address: string]: {
      data: PoolData | undefined
      chartData: PoolChartEntry[] | undefined
      transactions: Transaction[] | undefined
      lastUpdated: number | undefined
      tickData: PoolTickData | undefined
    }
  }
}
export type V2PoolChartEntry = {
  date: number
  aquaPremiumUSD: number
  totalValueLockedUSD: number
}

export interface V2PoolsState {
  // analytics data from
  byAddress: {
    [address: string]: {
      v2data: V2PoolData | undefined
      v2chartData: V2PoolChartEntry[] | undefined
      v2transactions: V2Transaction[] | undefined
      lastUpdated: number | undefined
      v2tickData: V2PoolTickData | undefined
    }
  }
}

export const initialState: PoolsState = { byAddress: {} }
export const V2initialState: V2PoolsState = { byAddress: {} }

export const pools = createReducer(initialState, (builder) =>
  builder
    .addCase(updatePoolData, (state, { payload: { pools } }) => {
      pools.map(
        (poolData) =>
          (state.byAddress[poolData.id] = {
            ...state.byAddress[poolData.id],
            data: poolData,
            lastUpdated: currentTimestamp(),
          })
      )
    })
    // add address to byAddress keys if not included yet
    .addCase(addPoolKeys, (state, { payload: { poolAddresses } }) => {
      poolAddresses.map((address) => {
        if (!state.byAddress[address]) {
          state.byAddress[address] = {
            data: undefined,
            chartData: undefined,
            transactions: undefined,
            lastUpdated: undefined,
            tickData: undefined,
          }
        }
      })
    })
    .addCase(updatePoolChartData, (state, { payload: { poolAddress, chartData } }) => {
      state.byAddress[poolAddress] = { ...state.byAddress[poolAddress], chartData: chartData }
    })
    .addCase(updatePoolTransactions, (state, { payload: { poolAddress, transactions } }) => {
      state.byAddress[poolAddress] = { ...state.byAddress[poolAddress], transactions }
    })
    .addCase(updateTickData, (state, { payload: { poolAddress, tickData } }) => {
      state.byAddress[poolAddress] = { ...state.byAddress[poolAddress], tickData }
    })
)

export const v2pools = createReducer(V2initialState, (builder) =>
  builder
    .addCase(updateV2PoolData, (state, { payload: { pools } }) => {
      pools.map(
        (poolData) =>
          (state.byAddress[poolData.id] = {
            ...state.byAddress[poolData.id],
            v2data: poolData,
            lastUpdated: currentTimestamp(),
          })
      )
    })
    // add address to byAddress keys if not included yet
    .addCase(addPoolKeys, (state, { payload: { poolAddresses } }) => {
      poolAddresses.map((address) => {
        if (!state.byAddress[address]) {
          state.byAddress[address] = {
            v2data: undefined,
            v2chartData: undefined,
            v2transactions: undefined,
            lastUpdated: undefined,
            v2tickData: undefined,
          }
        }
      })
    })
    .addCase(updateV2PoolChartData, (state, { payload: { poolAddress, v2chartData } }) => {
      state.byAddress[poolAddress] = { ...state.byAddress[poolAddress], v2chartData: v2chartData }
    })
    .addCase(updateV2PoolTransactions, (state, { payload: { poolAddress, v2transactions } }) => {
      state.byAddress[poolAddress] = { ...state.byAddress[poolAddress], v2transactions: v2transactions }
    })
    .addCase(updateV2TickData, (state, { payload: { poolAddress, tickData } }) => {
      state.byAddress[poolAddress] = { ...state.byAddress[poolAddress], v2tickData: tickData }
    })
)

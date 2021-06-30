import { currentTimestamp } from './../../utils/index'
import { updatePoolData, addPoolKeys, updatePoolChartData, updatePoolTransactions, updateTickData } from './actions'
import { createReducer } from '@reduxjs/toolkit'
import { SerializedToken } from 'state/user/actions'
import { Transaction } from 'types'
import { PoolTickData } from 'data/pools/tickData'

export interface Pool {
  address: string
  token0: SerializedToken
  token1: SerializedToken
}

// export interface PoolData2 {
//   // basic token info
//   feeTier: number
//   token0: {
//     symbol: string
//   }
//   token1: {
//     symbol: string
//   }
//   totalValueLocked: number
//   aquaPremium: number
//   aquaPremiumCollectedUSD: number
// }
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
  volumeUSD: number
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

export const initialState: PoolsState = { byAddress: {} }

export default createReducer(initialState, (builder) =>
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

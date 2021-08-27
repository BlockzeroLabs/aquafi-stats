import { currentTimestamp } from './../../utils/index'
import { updatePoolData, addPoolKeys, updatePoolChartData, updatePoolTransactions, updateTickData } from './actions'
import { createReducer } from '@reduxjs/toolkit'
import { SerializedToken } from 'state/user/actions'
import { Transaction } from 'types'
import { PoolTickData } from 'data/pools/tickData'
import { SupportedNetwork } from 'constants/networks'

export interface Pool {
  address: string
  token0: SerializedToken
  token1: SerializedToken
}

export interface PoolData {
  // basic token info
  address: string
  aquaPremium: number

  token0: {
    name: string
    symbol: string
    address: string
    decimals: number
    drivedETH: number
    drivedUSD: number
  }

  token1: {
    name: string
    symbol: string
    address: string
    decimals: number
    drivedETH: number
    drivedUSD: number
  }

  reserve0: number
  reserve1: number

  reserve0Staked: number
  reserve1Staked: number

  totalValueLockedDrivedUSD: number
  totalValueLockedDrivedUSDChange: number

  aquaPremiumAmount: number
  aquaPremiumAmountDrivedUSD: number
  aquaPremiumAmountDrivedUSDChange: number

  aquaAmount: number
  aquaAmountDrivedUSD: number
  aquaAmountDrivedUSDChange: number

  stakeCount: number
  activeStakeCount: number
  activeStakeCountChange: number
  unstakeCount: number

  // temporary
  feeTier: number
  token0Price: number
  token1Price: number
  volumeUSD: number
  volumeUSDChange: number
  tvlUSD: number
}

export type PoolChartEntry = {
  date: number
  totalValueLockedDrivedUSD: number
  aquaPremiumAmountDrivedUSD: number
  aquaAmountDrivedUSD: number
  stakeCount: number
  unstakeCount: number
}

export interface PoolsState {
  // analytics data from
  byAddress: {
    [networkId: string]: {
      [address: string]: {
        data: PoolData | undefined
        chartData: PoolChartEntry[] | undefined
        transactions: Transaction[] | undefined
        lastUpdated: number | undefined
        tickData: PoolTickData | undefined
      }
    }
  }
}

export const initialState: PoolsState = {
  byAddress: {
    [SupportedNetwork.UNISWAP_V2]: {},
    [SupportedNetwork.UNISWAP_V3]: {},
    [SupportedNetwork.SUSHISWAP]: {},
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updatePoolData, (state, { payload: { pools, networkId } }) => {
      pools.map(
        (poolData) =>
          (state.byAddress[networkId][poolData.address] = {
            ...state.byAddress[networkId][poolData.address],
            data: poolData,
            lastUpdated: currentTimestamp(),
          })
      )
    })
    // add address to byAddress keys if not included yet
    .addCase(addPoolKeys, (state, { payload: { poolAddresses, networkId } }) => {
      poolAddresses.map((address) => {
        if (!state.byAddress[networkId][address]) {
          state.byAddress[networkId][address] = {
            data: undefined,
            chartData: undefined,
            transactions: undefined,
            lastUpdated: undefined,
            tickData: undefined,
          }
        }
      })
    })
    .addCase(updatePoolChartData, (state, { payload: { poolAddress, chartData, networkId } }) => {
      state.byAddress[networkId][poolAddress] = { ...state.byAddress[networkId][poolAddress], chartData: chartData }
    })
    .addCase(updatePoolTransactions, (state, { payload: { poolAddress, transactions, networkId } }) => {
      state.byAddress[networkId][poolAddress] = { ...state.byAddress[networkId][poolAddress], transactions }
    })
    .addCase(updateTickData, (state, { payload: { poolAddress, tickData, networkId } }) => {
      state.byAddress[networkId][poolAddress] = { ...state.byAddress[networkId][poolAddress], tickData }
    })
)

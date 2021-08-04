import {
  addPoolKeys,
  updatePoolChartData,
  updateV2PoolChartData,
  updatePoolTransactions,
  updateV2PoolTransactions,
  updateTickData,
  updateV2TickData,
} from 'state/pools/actions'
import { AppState, AppDispatch } from './../index'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PoolData, V2PoolData, PoolChartEntry } from './reducer'
import { updatePoolData, updateV2PoolData } from './actions'
import { notEmpty } from 'utils'
import { fetchPoolChartData } from 'data/pools/chartData'
import { useChangeProtocol } from 'state/user/hooks'

import { Transaction, V2Transaction } from 'types'
import { fetchPoolTransactions, fetchV2PoolTransactions } from 'data/pools/transactions'
import { PoolTickData, V2PoolTickData } from 'data/pools/tickData'
import { protocol } from 'state/protocol/reducer'

export function useAllPoolData(): {
  [address: string]: { data: PoolData | undefined; lastUpdated: number | undefined }
} {
  return useSelector((state: AppState) => state.pools.byAddress)
}
export function useV2AllPoolData(): {
  [address: string]: { v2data: V2PoolData | undefined; lastUpdated: number | undefined }
} {
  return useSelector((state: AppState) => state.v2pools.byAddress)
}

export function useUpdatePoolData(): (pools: PoolData[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((pools: PoolData[]) => dispatch(updatePoolData({ pools })), [dispatch])
}
export function useUpdateV2PoolData(): (pools: V2PoolData[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((pools: V2PoolData[]) => dispatch(updateV2PoolData({ pools })), [dispatch])
}

export function useAddPoolKeys(): (addresses: string[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((poolAddresses: string[]) => dispatch(addPoolKeys({ poolAddresses })), [dispatch])
}

export function usePoolDatas(poolAddresses: string[]): PoolData[] {
  const allPoolData = useAllPoolData()
  const addPoolKeys = useAddPoolKeys()

  const untrackedAddresses = poolAddresses.reduce((accum: string[], address) => {
    if (!Object.keys(allPoolData).includes(address)) {
      accum.push(address)
    }
    return accum
  }, [])

  useEffect(() => {
    if (untrackedAddresses) {
      addPoolKeys(untrackedAddresses)
    }
    return
  }, [addPoolKeys, untrackedAddresses])

  // filter for pools with data
  const poolsWithData = poolAddresses
    .map((address) => {
      const poolData = allPoolData[address]?.data
      return poolData ?? undefined
    })
    .filter(notEmpty)

  return poolsWithData
}
export function useV2PoolDatas(poolAddresses: string[]): V2PoolData[] {
  const allPoolData = useV2AllPoolData()
  const addPoolKeys = useAddPoolKeys()

  const untrackedAddresses = poolAddresses.reduce((accum: string[], address) => {
    if (!Object.keys(allPoolData).includes(address)) {
      accum.push(address)
    }
    return accum
  }, [])

  useEffect(() => {
    if (untrackedAddresses) {
      addPoolKeys(untrackedAddresses)
    }
    return
  }, [addPoolKeys, untrackedAddresses])

  // filter for pools with data
  const poolsWithData = poolAddresses
    .map((address) => {
      const poolData = allPoolData[address]?.v2data
      return poolData ?? undefined
    })
    .filter(notEmpty)

  return poolsWithData
}

/**
 * Get top pools addresses that token is included in
 * If not loaded, fetch and store
 * @param address
 */

export function usePoolChartData(address: string): PoolChartEntry[] | undefined {
  const [protocol] = useChangeProtocol()

  const dispatch = useDispatch<AppDispatch>()
  const pool = useSelector((state: AppState) => state.pools.byAddress[address])
  const chartData = pool?.chartData
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { error, data } = await fetchPoolChartData(address, protocol)
      if (!error && data) {
        dispatch(updatePoolChartData({ poolAddress: address, chartData: data }))
      }
      if (error) {
        setError(error)
      }
    }
    if (!chartData && !error) {
      fetch()
    }
  }, [address, dispatch, error, chartData])

  // return data
  return chartData
}
export function useV2PoolChartData(address: string): PoolChartEntry[] | undefined {
  const [protocol] = useChangeProtocol()

  const dispatch = useDispatch<AppDispatch>()
  const pool = useSelector((state: AppState) => state.v2pools.byAddress[address])
  const chartData = pool?.v2chartData
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { error, data } = await fetchPoolChartData(address, protocol)
      if (!error && data) {
        dispatch(updateV2PoolChartData({ poolAddress: address, v2chartData: data }))
      }
      if (error) {
        setError(error)
      }
    }
    if (!chartData && !error) {
      fetch()
    }
  }, [address, dispatch, error, chartData])

  // return data
  return chartData
}

/**
 * Get all transactions on pool
 * @param address
 */
export function usePoolTransactions(address: string): Transaction[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const pool = useSelector((state: AppState) => state.pools.byAddress[address])
  const transactions = pool?.transactions
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { error, data } = await fetchPoolTransactions(address)
      if (error) {
        setError(true)
      } else if (data) {
        dispatch(updatePoolTransactions({ poolAddress: address, transactions: data }))
      }
    }
    if (!transactions && !error) {
      fetch()
    }
  }, [address, dispatch, error, transactions])

  // return data
  return transactions
}
export function useV2PoolTransactions(address: string): V2Transaction[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const pool = useSelector((state: AppState) => state.v2pools.byAddress[address])
  const v2transactions = pool?.v2transactions
  const [error, setError] = useState(false)
  const [protocol] = useChangeProtocol()

  useEffect(() => {
    async function fetchV2() {
      const { error, data } = await fetchV2PoolTransactions(address, protocol)
      if (error) {
        setError(true)
      } else if (data) {
        dispatch(updateV2PoolTransactions({ poolAddress: address, v2transactions: data }))
      }
    }
    if (!v2transactions && !error) {
      fetchV2()
    }
  }, [address, dispatch, error, v2transactions])

  // return data
  return v2transactions
}

export function usePoolTickData(
  address: string
): [PoolTickData | undefined, (poolAddress: string, tickData: PoolTickData) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const pool = useSelector((state: AppState) => state.pools.byAddress[address])
  const tickData = pool.tickData

  const setPoolTickData = useCallback(
    (address: string, tickData: PoolTickData) => dispatch(updateTickData({ poolAddress: address, tickData })),
    [dispatch]
  )

  return [tickData, setPoolTickData]
}
export function useV2PoolTickData(
  address: string
): [V2PoolTickData | undefined, (poolAddress: string, tickData: V2PoolTickData) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const pool = useSelector((state: AppState) => state.v2pools.byAddress[address])
  const tickData = pool.v2tickData

  const setPoolTickData = useCallback(
    (address: string, tickData: V2PoolTickData) => dispatch(updateV2TickData({ poolAddress: address, tickData })),
    [dispatch]
  )

  return [tickData, setPoolTickData]
}

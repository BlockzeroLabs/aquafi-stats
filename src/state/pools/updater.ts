import { useUpdatePoolData, useUpdateV2PoolData, useAllPoolData, useAddPoolKeys } from './hooks'
import { useEffect, useMemo } from 'react'
import { useTopPoolAddresses } from 'data/pools/topPools'
import { usePoolDatas, useV2PoolDatas } from 'data/pools/poolData'

export default function Updater(): null {
  // updaters
  const updatePoolData = useUpdatePoolData()
  const updateV2PoolData = useUpdateV2PoolData()
  const addPoolKeys = useAddPoolKeys()

  // data
  const allPoolData = useAllPoolData()
  const { loading, error, addresses } = useTopPoolAddresses()

  // add top pools on first load
  useEffect(() => {
    if (addresses && !error && !loading) {
      addPoolKeys(addresses)
    }
  }, [addPoolKeys, addresses, error, loading])

  // detect for which addresses we havent loaded pool data yet
  const unfetchedPoolAddresses = useMemo(() => {
    return Object.keys(allPoolData).reduce((accum: string[], key) => {
      const poolData = allPoolData[key]
      if (!poolData.data || !poolData.lastUpdated) {
        accum.push(key)
      }
      return accum
    }, [])
  }, [allPoolData])

  // update unloaded pool entries with fetched data
  const { error: poolDataError, loading: poolDataLoading, data: poolDatas } = usePoolDatas(unfetchedPoolAddresses)
  useEffect(() => {
    if (poolDatas && !poolDataError && !poolDataLoading) {
      updatePoolData(Object.values(poolDatas))
    }
  }, [poolDataError, poolDataLoading, poolDatas, updatePoolData])

  // for v2
  const { error: poolDataError2, loading: poolDataLoading2, data: poolDatas2 } = useV2PoolDatas(unfetchedPoolAddresses)
  useEffect(() => {
    if (poolDatas2 && !poolDataError2 && !poolDataLoading2) {
      updateV2PoolData(Object.values(poolDatas2))
    }
  }, [poolDataError, poolDataLoading, poolDatas2, updatePoolData])
  return null
}

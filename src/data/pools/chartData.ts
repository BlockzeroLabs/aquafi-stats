import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { PoolChartEntry } from 'state/pools/reducer'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60

const POOL_CHART = gql`
  query poolDayDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {
    poolDayDatas(
      first: 1000
      skip: $skip
      where: { pool: $address, date_gt: $startTime }
      orderBy: date
      orderDirection: asc
      subgraphError: allow
    ) {
      date
      totalValueLockedDrivedUSD
      aquaPremiumAmount
      aquaPremiumAmountDrivedUSD
      aquaAmount
      aquaAmountDrivedUSD
      stakeCount
      unstakeCount
      activeStakeCount
    }
  }
`

interface ChartResults {
  poolDayDatas: {
    date: number
    totalValueLockedDrivedUSD: string
    aquaPremiumAmount: string
    aquaPremiumAmountDrivedUSD: string
    aquaAmount: string
    aquaAmountDrivedUSD: string
    stakeCount: string
    unstakeCount: string
    activeStakeCount: string
  }[]
}

export async function fetchPoolChartData(address: string, client: ApolloClient<NormalizedCacheObject>) {
  // let data: {
  //   date: number
  //   volumeUSD: string
  //   tvlUSD: string
  // }[] = []

  // let data: PoolChartEntry[] = []

  let data: {
    date: number
    totalValueLockedDrivedUSD: string
    aquaPremiumAmount: string
    aquaPremiumAmountDrivedUSD: string
    aquaAmount: string
    aquaAmountDrivedUSD: string
    stakeCount: string
    unstakeCount: string
    activeStakeCount: string
  }[] = []

  const startTimestamp = 1619170975
  const endTimestamp = dayjs.utc().unix()

  let error = false
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      const { data: chartResData, error, loading } = await client.query<ChartResults>({
        query: POOL_CHART,
        variables: {
          address: address,
          startTime: startTimestamp,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      if (!loading) {
        skip += 1000
        if (chartResData.poolDayDatas.length < 1000 || error) {
          allFound = true
        }
        if (chartResData) {
          data = data.concat(chartResData.poolDayDatas)
        }
      }
    }
  } catch {
    error = true
  }

  if (data) {
    const formattedExisting = data.reduce((accum: { [date: number]: PoolChartEntry }, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
      accum[roundedDate] = {
        date: dayData.date,
        totalValueLockedDrivedUSD: parseFloat(dayData.totalValueLockedDrivedUSD),
        aquaPremiumAmount: parseFloat(dayData.aquaPremiumAmount),
        aquaPremiumAmountDrivedUSD: parseFloat(dayData.aquaPremiumAmountDrivedUSD),
        aquaAmount: parseFloat(dayData.aquaAmount),
        aquaAmountDrivedUSD: parseFloat(dayData.aquaAmountDrivedUSD),
        stakeCount: parseFloat(dayData.stakeCount),
        unstakeCount: parseFloat(dayData.unstakeCount),
        activeStakeCount: parseInt(dayData.activeStakeCount),
        // volumeUSD: parseFloat(dayData.volumeUSD),
        // totalValueLockedUSD: parseFloat(dayData.tvlUSD),
      }
      return accum
    }, {})

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestTvl = firstEntry?.totalValueLockedDrivedUSD ?? 0
    let latestAquaAmount = firstEntry?.aquaAmount ?? 0
    let latestActiveStakeCount = firstEntry?.activeStakeCount ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          totalValueLockedDrivedUSD: latestTvl,
          aquaPremiumAmount: 0,
          aquaPremiumAmountDrivedUSD: 0,
          aquaAmount: 0,
          aquaAmountDrivedUSD: latestAquaAmount,
          stakeCount: 0,
          unstakeCount: 0,
          activeStakeCount: latestActiveStakeCount,

          // date: nextDay,
          // volumeUSD: 0,
          // totalValueLockedDrivedUSD: latestTvl,
        }
      } else {
        latestTvl = formattedExisting[currentDayIndex].totalValueLockedDrivedUSD
        latestAquaAmount = formattedExisting[currentDayIndex].aquaAmount
        latestActiveStakeCount = formattedExisting[currentDayIndex].activeStakeCount
      }
      timestamp = nextDay
    }

    const dateMap = Object.keys(formattedExisting).map((key) => {
      return formattedExisting[parseInt(key)]
    })

    return {
      data: dateMap,
      error: false,
    }
  } else {
    return {
      data: undefined,
      error,
    }
  }
}

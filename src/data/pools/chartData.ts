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
      aquaPremiumAmountDrivedUSD
      aquaAmountDrivedUSD
      stakeCount
      unstakeCount
    }
  }
`

interface ChartResults {
  poolDayDatas: {
    date: number
    totalValueLockedDrivedUSD: string
    aquaPremiumAmountDrivedUSD: string
    aquaAmountDrivedUSD: string
    stakeCount: string
    unstakeCount: string
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
    aquaPremiumAmountDrivedUSD: string
    aquaAmountDrivedUSD: string
    stakeCount: string
    unstakeCount: string
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
        aquaPremiumAmountDrivedUSD: parseFloat(dayData.aquaPremiumAmountDrivedUSD),
        aquaAmountDrivedUSD: parseFloat(dayData.aquaAmountDrivedUSD),
        stakeCount: parseFloat(dayData.stakeCount),
        unstakeCount: parseFloat(dayData.unstakeCount),
        // volumeUSD: parseFloat(dayData.volumeUSD),
        // totalValueLockedUSD: parseFloat(dayData.tvlUSD),
      }
      return accum
    }, {})

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestTvl = firstEntry?.totalValueLockedDrivedUSD ?? 0
    const latestAquaAmountUSD = firstEntry?.aquaAmountDrivedUSD ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          totalValueLockedDrivedUSD: latestTvl,
          aquaPremiumAmountDrivedUSD: 0,
          aquaAmountDrivedUSD: latestAquaAmountUSD,
          stakeCount: 0,
          unstakeCount: 0,

          // date: nextDay,
          // volumeUSD: 0,
          // totalValueLockedDrivedUSD: latestTvl,
        }
      } else {
        latestTvl = formattedExisting[currentDayIndex].totalValueLockedDrivedUSD
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

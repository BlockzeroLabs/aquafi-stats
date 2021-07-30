import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { client, v2client } from 'apollo/client'
import { useChangeProtocol } from 'state/user/hooks'

// import { v2client, client as v3Client } from './../../apollo/client'

import { TokenChartEntry } from 'state/tokens/reducer'
import { PoolChartEntry } from 'state/pools/reducer'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60
// ($startTime: Int!, $skip: Int!, $address: Bytes!)
// (where: { pool: $address, date_gt: $startTime }, orderBy: date, orderDirection: asc)
const POOL_CHART = gql`
  query poolDayDatas($startTime: Int!, $address: Bytes!) {
    whitelistedPoolDayDatas(where: { pool: $address, date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      pool
      date
      aquaPremiumUSD
      tvlUSD
    }
  }
`

interface ChartResults {
  whitelistedPoolDayDatas: {
    date: number
    aquaPremiumUSD: string
    tvlUSD: string
  }[]
}

export async function fetchPoolChartData(address: string, protocol: string) {
  let data: {
    date: number
    aquaPremiumUSD: string
    tvlUSD: string
  }[] = []
  const startTimestamp = 1619170975
  const endTimestamp = dayjs.utc().unix()

  let error = false
  let skip = 0
  let allFound = false

  try {
    console.log('chal1')

    while (!allFound) {
      console.log('chal2')
      const clientl = protocol == 'v2' ? v2client : client
      const { data: chartResData, error, loading } = await clientl.query<ChartResults>({
        query: POOL_CHART,

        variables: {
          address: address,
          startTime: startTimestamp,
          skip,
        },
        // protocol == 'v2' ? { client: v2client } : { client: v3Client }

        fetchPolicy: 'cache-first',
      })
      console.log('POOL CHART DATA========', chartResData)
      if (!loading) {
        skip += 1000
        if (chartResData.whitelistedPoolDayDatas.length < 1000 || error) {
          allFound = true
        }
        if (chartResData) {
          data = data.concat(chartResData.whitelistedPoolDayDatas)
        }
        console.log('POOL CHART DATA==== data', data)
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
        aquaPremiumUSD: parseFloat(dayData.aquaPremiumUSD),
        totalValueLockedUSD: parseFloat(dayData.tvlUSD),
      }
      console.log('accum============', accum)
      return accum
    }, {})

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestTvl = firstEntry?.totalValueLockedUSD ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          aquaPremiumUSD: 0,
          totalValueLockedUSD: latestTvl,
        }
      } else {
        latestTvl = formattedExisting[currentDayIndex].totalValueLockedUSD
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

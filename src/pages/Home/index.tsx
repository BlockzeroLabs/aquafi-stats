import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { ResponsiveRow, RowBetween, RowFixed } from 'components/Row'
import LineChart from 'components/LineChart/alt'
import useTheme from 'hooks/useTheme'
import {
  useProtocolData,
  useProtocolChartData,
  useProtocolTransactions,
  useV2ProtocolTransactions,
  useV2ProtocolData,
  useV2ProtocolChartData,
} from 'state/protocol/hooks'
import { DarkGreyCard } from 'components/Card'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { HideMedium, HideSmall, StyledInternalLink } from '../../theme/components'
import TokenTable from 'components/tokens/TokenTable'
import { PoolTable, V2PoolTable } from 'components/pools/PoolTable'
import { PageWrapper, ThemedBackgroundGlobal } from 'pages/styled'
import { unixToDate } from 'utils/date'
import BarChart from 'components/BarChart/alt'
import { useAllPoolData, useV2AllPoolData } from 'state/pools/hooks'
import { notEmpty } from 'utils'
import { TransactionTableV3, TransactionTableV2 } from '../../components/TransactionsTable'
import { useAllTokenData } from 'state/tokens/hooks'
import { MonoSpace } from 'components/shared'
import { useChangeProtocol } from 'state/user/hooks'
import dayjs from 'dayjs'

const ChartWrapper = styled.div`
  width: 49%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const theme = useTheme()
  const [protocol] = useChangeProtocol()

  const [protocolData] = useProtocolData()
  const [v2protocolData] = useV2ProtocolData()
  const [chartData] = useProtocolChartData()
  const [v2chartData] = useV2ProtocolChartData()
  const [transactions] = useProtocolTransactions()
  const [v2transactions] = useV2ProtocolTransactions()
  // const V2transactions = useV2PoolTransactions(address)

  console.log('v2chartData  v2transactions v2protocolData=========', v2chartData, v2transactions, v2protocolData)
  const [volumeHover, setVolumeHover] = useState<number | undefined>()
  const [liquidityHover, setLiquidityHover] = useState<number | undefined>()
  const [leftLabel, setLeftLabel] = useState<string | undefined>()
  const [rightLabel, setRightLabel] = useState<string | undefined>()

  // get all the pool datas that exist
  const allPoolData = useAllPoolData()
  const allV2PoolData = useV2AllPoolData()
  console.log('HOME PAGE All pool data ===========', allPoolData, allV2PoolData)

  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((p) => p.data)
      .filter(notEmpty)
  }, [allPoolData])

  const v2poolDatas = useMemo(() => {
    return Object.values(allV2PoolData)
      .map((p) => p.v2data)
      .filter(notEmpty)
  }, [allV2PoolData])

  console.log('poolDatas v2poolDatas =====', poolDatas, v2poolDatas)
  // if hover value undefined, reset to current day value
  // useEffect(() => {
  //   if (!volumeHover && protocolData) {
  //     setVolumeHover(protocolData.volumeUSD)
  //   }
  // }, [protocolData, volumeHover])
  // useEffect(() => {
  //   if (!liquidityHover && protocolData) {
  //     setLiquidityHover(protocolData.tvlUSD)
  //   }
  // }, [liquidityHover, protocolData])

  const formattedTvlData = useMemo(() => {
    if (protocol == 'v3' && chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.tvlUSD,
        }
      })
    }
    if (protocol == 'v2' && v2chartData) {
      return v2chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.tvlUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData, v2chartData, protocol])

  console.log('formattedTvlData =====', formattedTvlData)

  const formattedVolumeData = useMemo(() => {
    if (protocol == 'v3' && chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.aquaPremiumUSD,
        }
      })
    }
    if (protocol == 'v2' && v2chartData) {
      return v2chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.aquaPremiumUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData, v2chartData, protocol])

  // const allTokens = useAllTokenData()

  // const formattedTokens = useMemo(() => {
  //   return Object.values(allTokens)
  //     .map((t) => t.data)
  //     .filter(notEmpty)
  // }, [allTokens])

  return (
    <PageWrapper>
      <ThemedBackgroundGlobal backgroundColor={'#71cbc7'} />
      <AutoColumn gap="16px">
        <TYPE.main>Uniswap Overview</TYPE.main>
        <ResponsiveRow>
          <ChartWrapper>
            <LineChart
              data={formattedTvlData}
              height={220}
              minHeight={332}
              color={theme.pink1}
              value={liquidityHover}
              label={leftLabel}
              setValue={setLiquidityHover}
              setLabel={setLeftLabel}
              topLeft={
                <AutoColumn gap="4px">
                  <TYPE.mediumHeader fontSize="16px">TVL</TYPE.mediumHeader>
                  <TYPE.largeHeader fontSize="32px">
                    <MonoSpace>{formatDollarAmount(liquidityHover, 2, true)} </MonoSpace>
                  </TYPE.largeHeader>
                  <TYPE.main fontSize="12px" height="14px">
                    {leftLabel ? (
                      <MonoSpace>{leftLabel}</MonoSpace>
                    ) : (
                      <MonoSpace>{dayjs.utc().format('MMM D, YYYY')}</MonoSpace>
                    )}
                  </TYPE.main>
                </AutoColumn>
              }
            />
          </ChartWrapper>
          <ChartWrapper>
            <BarChart
              height={220}
              minHeight={332}
              data={formattedVolumeData}
              color={theme.blue1}
              setValue={setVolumeHover}
              setLabel={setRightLabel}
              value={volumeHover}
              label={rightLabel}
              topLeft={
                <AutoColumn gap="4px">
                  <TYPE.mediumHeader fontSize="16px">Aqua Premium</TYPE.mediumHeader>
                  <TYPE.largeHeader fontSize="32px">
                    <MonoSpace> {formatDollarAmount(volumeHover, 2)}</MonoSpace>
                  </TYPE.largeHeader>
                  <TYPE.main fontSize="12px" height="14px">
                    {rightLabel ? (
                      <MonoSpace>{rightLabel}</MonoSpace>
                    ) : (
                      <MonoSpace>{dayjs.utc().format('MMM D, YYYY')}</MonoSpace>
                    )}
                  </TYPE.main>
                </AutoColumn>
              }
            />
          </ChartWrapper>
        </ResponsiveRow>
        <HideSmall>
          <DarkGreyCard>
            <RowBetween>
              <RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">TVL: </TYPE.main>
                  <TYPE.label mr="4px">
                    {formatDollarAmount(protocol == 'v3' ? protocolData?.tvlUSD : v2protocolData?.tvlUSD)}
                  </TYPE.label>
                  <TYPE.main></TYPE.main>
                  <Percent value={protocolData?.activeTvlUSD} wrap={true} />
                </RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Active TVL : </TYPE.main>
                  <TYPE.label mr="4px">
                    {formatDollarAmount(protocol == 'v3' ? protocolData?.activeTvlUSD : v2protocolData?.activeTvlUSD)}
                  </TYPE.label>
                  <Percent value={protocolData?.activeTvlUSDChange} wrap={true} />
                </RowFixed>
                <HideMedium>
                  <RowFixed mr="20px">
                    <TYPE.main mr="4px">Aqua Premium </TYPE.main>
                    <TYPE.label mr="4px">
                      {formatDollarAmount(
                        protocol == 'v3' ? protocolData?.aquaPremiumUSD : v2protocolData?.aquaPremiumUSD
                      )}
                    </TYPE.label>
                    <Percent
                      value={protocol == 'v3' ? protocolData?.aquaPremiumChange : v2protocolData?.aquaPremiumChange}
                      wrap={true}
                    />
                  </RowFixed>
                </HideMedium>
              </RowFixed>
            </RowBetween>
          </DarkGreyCard>
        </HideSmall>
        {/* <RowBetween>
          <TYPE.main>Top Tokens</TYPE.main>
          <StyledInternalLink to="/tokens">Explore</StyledInternalLink>
        </RowBetween>
        <TokenTable tokenDatas={formattedTokens} /> */}
        <RowBetween>
          <TYPE.main>Top Pools</TYPE.main>
          <StyledInternalLink to="/pools">Explore</StyledInternalLink>
        </RowBetween>
        {protocol == 'v3' ? (
          <PoolTable poolDatas={poolDatas} />
        ) : protocol == 'v2' ? (
          <V2PoolTable poolDatas={v2poolDatas} />
        ) : null}
        <RowBetween>
          <TYPE.main>Transactions</TYPE.main>
        </RowBetween>
        {protocol == 'v3' && transactions ? (
          <TransactionTableV3 transactions={transactions} />
        ) : protocol == 'v2' && v2transactions ? (
          <TransactionTableV2 transactions={v2transactions} />
        ) : null}
      </AutoColumn>
    </PageWrapper>
  )
}

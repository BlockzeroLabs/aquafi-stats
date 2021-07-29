import React, { useMemo, useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components'
import { useColor } from 'hooks/useColor'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { feeTierPercent, getEtherscanLink } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import Loader, { LocalLoader } from 'components/Loader'
import { ExternalLink, Download } from 'react-feather'
import { ExternalLink as StyledExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonPrimary, ButtonGray, SavedIcon } from 'components/Button'
import { DarkGreyCard, GreyCard, GreyBadge } from 'components/Card'
import {
  usePoolDatas,
  useV2PoolDatas,
  usePoolChartData,
  useV2PoolChartData,
  usePoolTransactions,
  useV2PoolTransactions,
} from 'state/pools/hooks'
import { useChangeProtocol } from 'state/user/hooks'

import LineChart from 'components/LineChart/alt'
import { unixToDate } from 'utils/date'
import { ToggleWrapper, ToggleElementFree } from 'components/Toggle/index'
import BarChart from 'components/BarChart/alt'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { TransactionTableV3, TransactionTableV2 } from 'components/TransactionsTable'
import { useSavedPools } from 'state/user/hooks'
import DensityChart from 'components/DensityChart'
import { MonoSpace } from 'components/shared'

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-gap: 1em;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`

const TokenButton = styled(GreyCard)`
  padding: 8px 12px;
  border-radius: 10px;
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`

enum ChartView {
  TVL,
  VOL,
  PRICE,
  DENSITY,
}

export default function PoolPage({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // theming
  const backgroundColor = useColor()
  const theme = useTheme()

  const [protocol] = useChangeProtocol()

  // token data
  const poolData = usePoolDatas([address])[0]
  const v2poolData = useV2PoolDatas([address])[0]

  const chartData = usePoolChartData(address)
  const v2chartData = useV2PoolChartData(address)

  const transactions = usePoolTransactions(address)
  const v2transactions = useV2PoolTransactions(address)
  console.log('Transaction V2transactions', transactions, v2transactions)

  const [view, setView] = useState(ChartView.VOL)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()

  const formattedTvlData = useMemo(() => {
    if (chartData && protocol == 'v3') {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.totalValueLockedUSD,
        }
      })
    }
    if (v2chartData && protocol == 'v2') {
      return v2chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.totalValueLockedUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData, v2chartData])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.aquaPremiumUSD,
        }
      })
    }
    if (v2chartData) {
      return v2chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.aquaPremiumUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData, v2chartData])

  //watchlist
  const [savedPools, addSavedPool] = useSavedPools()
  console.log('POOl page data ===', poolData, v2poolData)

  const run = (poolData: any, transactions: any) => {
    return (
      <AutoColumn gap="32px">
        <RowBetween>
          <AutoRow gap="4px">
            <StyledInternalLink to="/">
              <TYPE.main>{`Home > `}</TYPE.main>
            </StyledInternalLink>
            <StyledInternalLink to="/pools">
              <TYPE.label>{` Pools `}</TYPE.label>
            </StyledInternalLink>
            <TYPE.main>{` > `}</TYPE.main>
            <TYPE.label>{` ${poolData.token0.symbol} / ${poolData.token1.symbol} ${feeTierPercent(
              parseFloat(poolData.feeTier)
            )} `}</TYPE.label>
          </AutoRow>
          <RowFixed gap="10px" align="center">
            <SavedIcon fill={savedPools.includes(address)} onClick={() => addSavedPool(address)} />
            <StyledExternalLink href={getEtherscanLink(1, address, 'address')}>
              <ExternalLink stroke={theme.text2} size={'17px'} style={{ marginLeft: '12px' }} />
            </StyledExternalLink>
          </RowFixed>
        </RowBetween>
        <ResponsiveRow align="flex-end">
          <AutoColumn gap="lg">
            <RowFixed gap="4px">
              <DoubleCurrencyLogo address0={poolData.token0.id} address1={poolData.token1.id} size={24} />
              <TYPE.label
                ml="8px"
                mr="8px"
                fontSize="24px"
              >{` ${poolData.token0.symbol} / ${poolData.token1.symbol} `}</TYPE.label>
              <GreyBadge>{feeTierPercent(parseFloat(poolData.feeTier))}</GreyBadge>
            </RowFixed>
            <ResponsiveRow>
              {/* <StyledInternalLink to={'/tokens/' + poolData.token0.id}> */}
              <TokenButton>
                <RowFixed>
                  <CurrencyLogo address={poolData.token0.id} size={'20px'} />
                  <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width={'fit-content'}>
                    {`1 ${poolData.token0.symbol} =  ${formatAmount(parseFloat(poolData.token1Price), 4)} ${
                      poolData.token1.symbol
                    }`}
                  </TYPE.label>
                </RowFixed>
              </TokenButton>
              {/* </StyledInternalLink> */}
              {/* <StyledInternalLink to={'/tokens/' + poolData.token1.id}> */}
              <TokenButton ml="10px">
                <RowFixed>
                  <CurrencyLogo address={poolData.token1.id} size={'20px'} />
                  <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width={'fit-content'}>
                    {`1 ${poolData.token1.symbol} =  ${formatAmount(parseFloat(poolData.token0Price), 4)} ${
                      poolData.token0.symbol
                    }`}
                  </TYPE.label>
                </RowFixed>
              </TokenButton>
              {/* </StyledInternalLink> */}
            </ResponsiveRow>
          </AutoColumn>
          {/* <AutoColumn gap="lg">
              <RowFixed>
                <StyledExternalLink
                  href={`https://app.uniswap.org/#/add/${poolData.token0.id}/${poolData.token1.id}/${poolData.feeTier}`}
                >
                  <ButtonGray width="170px" mr="12px" style={{ height: '44px' }}>
                    <RowBetween>
                      <Download size={24} />
                      <div style={{ display: 'flex', alignItems: 'center' }}>Add Liquidity</div>
                    </RowBetween>
                  </ButtonGray>
                </StyledExternalLink>
                <StyledExternalLink
                  href={`https://app.uniswap.org/#/swap?inputCurrency=${poolData.token0.id}&outputCurrency=${poolData.token1.id}`}
                >
                  <ButtonPrimary width="100px" style={{ height: '44px' }}>
                    Trade
                  </ButtonPrimary>
                </StyledExternalLink>
              </RowFixed>
            </AutoColumn> */}
        </ResponsiveRow>
        <ContentLayout>
          <DarkGreyCard>
            <AutoColumn gap="lg">
              <GreyCard padding="16px">
                <AutoColumn gap="md">
                  <TYPE.main>Total Value Locked</TYPE.main>
                  <RowBetween>
                    <RowFixed>
                      <CurrencyLogo address={poolData.token0.id} size={'20px'} />
                      <TYPE.label fontSize="14px" ml="8px">
                        {poolData.token0.symbol}
                      </TYPE.label>
                    </RowFixed>
                    <TYPE.label fontSize="14px">{formatAmount(parseFloat(poolData.totalValueLockedToken0))}</TYPE.label>
                  </RowBetween>
                  <RowBetween>
                    <RowFixed>
                      <CurrencyLogo address={poolData.token1.id} size={'20px'} />
                      <TYPE.label fontSize="14px" ml="8px">
                        {poolData.token1.symbol}
                      </TYPE.label>
                    </RowFixed>
                    <TYPE.label fontSize="14px">{formatAmount(parseFloat(poolData.totalValueLockedToken1))}</TYPE.label>
                  </RowBetween>
                </AutoColumn>
              </GreyCard>
              <AutoColumn gap="4px">
                <TYPE.main fontWeight={400}>TVL</TYPE.main>
                <TYPE.label fontSize="24px">{formatDollarAmount(parseFloat(poolData.totalValueLocked))}</TYPE.label>
                <Percent value={poolData.tvlUSDChange} />
              </AutoColumn>
              <AutoColumn gap="4px">
                <TYPE.main fontWeight={400}>Aqua Premium</TYPE.main>
                <TYPE.label fontSize="24px">
                  {formatDollarAmount(parseFloat(poolData.aquaPremiumCollectedUSD))}
                </TYPE.label>
                <Percent value={poolData.aquaPremiumCollectedUSDChange} />
              </AutoColumn>
              <AutoColumn gap="4px">
                <TYPE.main fontWeight={400}>Premium %</TYPE.main>
                <TYPE.label fontSize="24px">{parseFloat(poolData.aquaPremium) / 100}%</TYPE.label>
              </AutoColumn>
            </AutoColumn>
          </DarkGreyCard>
          <DarkGreyCard>
            <RowBetween align="flex-start">
              <AutoColumn>
                <TYPE.label fontSize="24px" height="30px">
                  <MonoSpace>
                    {latestValue
                      ? formatDollarAmount(latestValue)
                      : view === ChartView.VOL
                      ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                      : view === ChartView.DENSITY
                      ? ''
                      : formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)}{' '}
                  </MonoSpace>
                </TYPE.label>
                <TYPE.main height="20px" fontSize="12px">
                  {valueLabel ? <MonoSpace>{valueLabel}</MonoSpace> : ''}
                </TYPE.main>
              </AutoColumn>
              <ToggleWrapper width="200px">
                <ToggleElementFree
                  isActive={view === ChartView.TVL}
                  fontSize="12px"
                  onClick={() => (view === ChartView.TVL ? setView(ChartView.DENSITY) : setView(ChartView.TVL))}
                >
                  TVL
                </ToggleElementFree>
                <ToggleElementFree
                  isActive={view === ChartView.VOL}
                  fontSize="12px"
                  onClick={() => (view === ChartView.VOL ? setView(ChartView.TVL) : setView(ChartView.VOL))}
                >
                  Aqua Premium
                </ToggleElementFree>
                {/* <ToggleElementFree
                    isActive={view === ChartView.DENSITY}
                    fontSize="12px"
                    onClick={() => (view === ChartView.DENSITY ? setView(ChartView.VOL) : setView(ChartView.DENSITY))}
                  >
                    Liquidity
                  </ToggleElementFree> */}
              </ToggleWrapper>
            </RowBetween>
            {view === ChartView.TVL ? (
              <LineChart
                data={formattedTvlData}
                setLabel={setValueLabel}
                color={backgroundColor}
                minHeight={340}
                setValue={setLatestValue}
                value={latestValue}
                label={valueLabel}
              />
            ) : view === ChartView.VOL ? (
              <BarChart
                data={formattedVolumeData}
                color={backgroundColor}
                minHeight={340}
                setValue={setLatestValue}
                setLabel={setValueLabel}
                value={latestValue}
                label={valueLabel}
              />
            ) : (
              <DensityChart address={address} />
            )}
          </DarkGreyCard>
        </ContentLayout>
        <TYPE.main fontSize="24px">Transactions</TYPE.main>
        <DarkGreyCard>
          {protocol == 'v3' && transactions ? (
            <TransactionTableV3 transactions={transactions} />
          ) : protocol == 'v2' && transactions ? (
            <TransactionTableV2 transactions={transactions} />
          ) : (
            // <LocalLoader fill={false} />
            <Loader />
          )}
        </DarkGreyCard>
      </AutoColumn>
    )
  }

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      {protocol == 'v3' && poolData ? (
        run(poolData, transactions)
      ) : protocol == 'v2' && v2poolData ? (
        run(v2poolData, v2transactions)
      ) : (
        <Loader />
      )}
    </PageWrapper>
  )
}

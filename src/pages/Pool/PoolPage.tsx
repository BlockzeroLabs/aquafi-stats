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
import { usePoolDatas, usePoolChartData, usePoolTransactions } from 'state/pools/hooks'
import LineChart from 'components/LineChart/alt'
import { unixToDate } from 'utils/date'
import { ToggleWrapper, ToggleElementFree } from 'components/Toggle/index'
import BarChart from 'components/BarChart/alt'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import TransactionTable from 'components/TransactionsTable'
import { useSavedPools } from 'state/user/hooks'
// import DensityChart from 'components/DensityChart'
import { MonoSpace } from 'components/shared'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import { EthereumNetworkInfo, SupportedNetwork } from 'constants/networks'
import { GenericImageWrapper } from 'components/Logo'
import Chart from 'components/LineChart/alt'

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
  AQUA_AMUOUNT,
  STAKE,
  // VOL,
  // PRICE,
  // DENSITY,
}

export default function PoolPage({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) {
  const [activeNetwork] = useActiveNetworkVersion()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // theming
  const backgroundColor = useColor()
  const theme = useTheme()

  // token data
  const poolData = usePoolDatas([address])[0]
  const chartData = usePoolChartData(address)
  const transactions = usePoolTransactions(address)

  const [view, setView] = useState<ChartView>(ChartView.TVL)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.totalValueLockedDrivedUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const formattedAquaAmountData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.aquaAmount,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const formattedStakeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.activeStakeCount,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  //watchlist
  const [savedPools, addSavedPool] = useSavedPools()

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      {poolData ? (
        <AutoColumn gap="32px">
          <RowBetween>
            <AutoRow gap="4px">
              <StyledInternalLink to={networkPrefix(activeNetwork)}>
                <TYPE.main>{`Home > `}</TYPE.main>
              </StyledInternalLink>
              <StyledInternalLink to={networkPrefix(activeNetwork) + 'pools'}>
                <TYPE.label>{` Pools `}</TYPE.label>
              </StyledInternalLink>
              <TYPE.main>{` > `}</TYPE.main>
              <TYPE.label>{` ${poolData.token0.symbol} / ${poolData.token1.symbol}`}</TYPE.label>
            </AutoRow>
            <RowFixed gap="10px" align="center">
              <SavedIcon fill={savedPools.includes(address)} onClick={() => addSavedPool(address)} />
              <StyledExternalLink
                href={getEtherscanLink(
                  parseInt(process.env.REACT_APP_CHAIN_ID ?? '1'),
                  address,
                  'address',
                  activeNetwork
                )}
              >
                <ExternalLink stroke={theme.text2} size={'17px'} style={{ marginLeft: '12px' }} />
              </StyledExternalLink>
            </RowFixed>
          </RowBetween>
          <ResponsiveRow align="flex-end">
            <AutoColumn gap="lg">
              <RowFixed>
                <DoubleCurrencyLogo address0={poolData.token0.address} address1={poolData.token1.address} size={24} />
                <TYPE.label
                  ml="8px"
                  mr="8px"
                  fontSize="24px"
                >{` ${poolData.token0.symbol} / ${poolData.token1.symbol} `}</TYPE.label>
                {activeNetwork.id === SupportedNetwork.UNISWAP_V3 && (
                  <GreyBadge>{feeTierPercent(poolData.feeTier)}</GreyBadge>
                )}
                {activeNetwork === EthereumNetworkInfo ? null : (
                  <GenericImageWrapper src={activeNetwork.imageURL} style={{ marginLeft: '8px' }} size={'26px'} />
                )}
              </RowFixed>
              <ResponsiveRow>
                {/* <StyledInternalLink to={networkPrefix(activeNetwork) + 'tokens/' + poolData.token0.address}>
                  <TokenButton>
                    <RowFixed>
                      <CurrencyLogo address={poolData.token0.address} size={'20px'} />
                      <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width={'fit-content'}>
                        {`1 ${poolData.token0.symbol} =  ${formatAmount(poolData.token1Price, 4)} ${
                          poolData.token1.symbol
                        }`}
                      </TYPE.label>
                    </RowFixed>
                  </TokenButton>
                </StyledInternalLink> */}
                {/* <StyledInternalLink
                to={networkPrefix(activeNetwork) + 'tokens/' + poolData.token1.address}
                >
                  <TokenButton ml="10px">
                    <RowFixed>
                      <CurrencyLogo address={poolData.token1.address} size={'20px'} />
                      <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width={'fit-content'}>                        
                        {}
                      </TYPE.label>
                    </RowFixed>
                  </TokenButton>
                </StyledInternalLink> */}
              </ResponsiveRow>
            </AutoColumn>
            {/* {activeNetwork !== EthereumNetworkInfo ? null : (
              <RowFixed>
                <StyledExternalLink
                  href={`https://app.uniswap.org/#/add/${poolData.token0.address}/${poolData.token1.address}/${poolData.feeTier}`}
                >
                  <ButtonGray width="170px" mr="12px" style={{ height: '44px' }}>
                    <RowBetween>
                      <Download size={24} />
                      <div style={{ display: 'flex', alignItems: 'center' }}>Add Liquidity</div>
                    </RowBetween>
                  </ButtonGray>
                </StyledExternalLink>
                <StyledExternalLink
                  href={`https://app.uniswap.org/#/swap?inputCurrency=${poolData.token0.address}&outputCurrency=${poolData.token1.address}`}
                >
                  <ButtonPrimary width="100px" style={{ height: '44px' }}>
                    Trade
                  </ButtonPrimary>
                </StyledExternalLink>
              </RowFixed>
            )} */}
          </ResponsiveRow>
          <ContentLayout>
            <DarkGreyCard>
              <AutoColumn gap="lg">
                <GreyCard padding="16px">
                  <AutoColumn gap="md">
                    <TYPE.main>Tokens Locked</TYPE.main>
                    <RowBetween>
                      <RowFixed>
                        <CurrencyLogo address={poolData.token0.address} size={'20px'} />
                        <TYPE.label fontSize="14px" ml="8px">
                          {poolData.token0.symbol}
                        </TYPE.label>
                      </RowFixed>
                      <TYPE.label fontSize="14px">{formatAmount(poolData.reserve0Staked)}</TYPE.label>
                    </RowBetween>
                    <RowBetween>
                      <RowFixed>
                        <CurrencyLogo address={poolData.token1.address} size={'20px'} />
                        <TYPE.label fontSize="14px" ml="8px">
                          {poolData.token1.symbol}
                        </TYPE.label>
                      </RowFixed>
                      <TYPE.label fontSize="14px">{formatAmount(poolData.reserve1Staked)}</TYPE.label>
                    </RowBetween>
                  </AutoColumn>
                </GreyCard>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>TVL</TYPE.main>
                  <TYPE.label fontSize="24px">{formatDollarAmount(poolData.totalValueLockedDrivedUSD)}</TYPE.label>
                  <Percent value={poolData.totalValueLockedDrivedUSDChange} />
                </AutoColumn>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>Premium Paid</TYPE.main>
                  <TYPE.label fontSize="24px">{`${formatAmount(poolData.aquaPremiumAmount)} AQUA`}</TYPE.label>
                  <Percent value={poolData.aquaPremiumAmountDrivedUSDChange} />
                </AutoColumn>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>Total Reward</TYPE.main>
                  <TYPE.label fontSize="24px">{`${formatAmount(poolData.aquaAmount)} AQUA`}</TYPE.label>
                  <Percent value={poolData.aquaAmountDrivedUSDChange} />
                </AutoColumn>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>Stakes</TYPE.main>
                  <TYPE.label fontSize="24px">{poolData.activeStakeCount}</TYPE.label>
                  <Percent value={poolData.activeStakeCountChange} />
                </AutoColumn>
              </AutoColumn>
            </DarkGreyCard>
            <DarkGreyCard
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
            >
              <RowBetween align="flex-start">
                <AutoColumn style={{ marginLeft: '45px' }}>
                  <TYPE.label fontSize="24px" height="30px">
                    <MonoSpace>
                      {view === ChartView.TVL
                        ? latestValue
                          ? formatDollarAmount(latestValue)
                          : formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)
                        : view === ChartView.AQUA_AMUOUNT
                        ? latestValue
                          ? `${formatAmount(latestValue)} AQUA`
                          : `${formatAmount(formattedAquaAmountData[formattedAquaAmountData.length - 1]?.value)} AQUA`
                        : latestValue
                        ? latestValue
                        : formattedStakeData[formattedStakeData.length - 1]?.value}
                    </MonoSpace>
                  </TYPE.label>
                  <TYPE.main height="20px" fontSize="12px">
                    {valueLabel ? <MonoSpace>{valueLabel} (UTC)</MonoSpace> : ''}
                  </TYPE.main>
                </AutoColumn>
                <ToggleWrapper width="250px" style={{ marginRight: '45px' }}>
                  <ToggleElementFree
                    isActive={view === ChartView.TVL}
                    fontSize="12px"
                    onClick={() => (view === ChartView.TVL ? setView(ChartView.AQUA_AMUOUNT) : setView(ChartView.TVL))}
                  >
                    TVL
                  </ToggleElementFree>
                  <ToggleElementFree
                    isActive={view === ChartView.AQUA_AMUOUNT}
                    fontSize="12px"
                    onClick={() =>
                      view === ChartView.AQUA_AMUOUNT ? setView(ChartView.TVL) : setView(ChartView.AQUA_AMUOUNT)
                    }
                  >
                    Aqua Rewarded
                  </ToggleElementFree>
                  <ToggleElementFree
                    isActive={view === ChartView.STAKE}
                    fontSize="12px"
                    onClick={() => (view === ChartView.STAKE ? setView(ChartView.TVL) : setView(ChartView.STAKE))}
                  >
                    Stakes
                  </ToggleElementFree>
                </ToggleWrapper>
              </RowBetween>
              {view === ChartView.TVL ? (
                <LineChart
                  data={formattedTvlData}
                  setLabel={setValueLabel}
                  color={backgroundColor}
                  minHeight={400}
                  setValue={setLatestValue}
                  value={latestValue}
                  label={valueLabel}
                />
              ) : view === ChartView.AQUA_AMUOUNT ? (
                <LineChart
                  data={formattedAquaAmountData}
                  color={backgroundColor}
                  minHeight={400}
                  setValue={setLatestValue}
                  setLabel={setValueLabel}
                  value={latestValue}
                  label={valueLabel}
                />
              ) : (
                <LineChart
                  data={formattedStakeData}
                  color={backgroundColor}
                  minHeight={400}
                  setValue={setLatestValue}
                  setLabel={setValueLabel}
                  value={latestValue}
                  label={valueLabel}
                />
              )}
            </DarkGreyCard>
          </ContentLayout>
          <TYPE.main fontSize="24px">Transactions</TYPE.main>
          <DarkGreyCard>
            {transactions ? <TransactionTable transactions={transactions} /> : <LocalLoader fill={false} />}
          </DarkGreyCard>
        </AutoColumn>
      ) : (
        <Loader />
      )}
    </PageWrapper>
  )
}

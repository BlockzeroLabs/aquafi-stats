import React, { useMemo, useEffect } from 'react'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components'
import { PageWrapper, ThemedBackgroundGlobal } from 'pages/styled'
import { HideSmall, TYPE } from 'theme'
import { ResponsiveRow, RowBetween, RowFixed } from 'components/Row'
import LineChart from 'components/LineChart/alt'
import { unixToDate } from 'utils/date'
import { useOverallChartData, useOverallData } from 'state/overall/hooks'
import { MonoSpace } from 'components/shared'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { useState } from 'react'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { DarkGreyCard } from 'components/Card'
import Percent from 'components/Percent'
import { SupportedNetwork } from 'constants/networks'

const ChartWrapper = styled.div`
  width: 49%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

interface ChartType {
  time: string
  value: number
}

export default function Global() {
  const [activeNetwork] = useActiveNetworkVersion()

  const [volumeHoverV2, setVolumeHoverV2] = useState<number | undefined>()
  const [liquidityHoverV2, setLiquidityHoverV2] = useState<number | undefined>()
  const [leftLabelV2, setLeftLabelV2] = useState<string | undefined>()
  const [rightLabelV2, setRightLabelV2] = useState<string | undefined>()

  const [volumeHoverV3, setVolumeHoverV3] = useState<number | undefined>()
  const [liquidityHoverV3, setLiquidityHoverV3] = useState<number | undefined>()
  const [leftLabelV3, setLeftLabelV3] = useState<string | undefined>()
  const [rightLabelV3, setRightLabelV3] = useState<string | undefined>()

  const [volumeHoverSushi, setVolumeHoverSushi] = useState<number | undefined>()
  const [liquidityHoverSushi, setLiquidityHoverSushi] = useState<number | undefined>()
  const [leftLabelSushi, setLeftLabelSushi] = useState<string | undefined>()
  const [rightLabelSushi, setRightLabelSushi] = useState<string | undefined>()

  const [dataV2, dataV3, dataSushi] = useOverallData()
  const [chartV2, chartV3, chartSushi] = useOverallChartData()

  useEffect(() => {
    if (activeNetwork.id === SupportedNetwork.OVER_VIEW) {
      setLiquidityHoverV2(undefined)
      setVolumeHoverV2(undefined)

      setLiquidityHoverV3(undefined)
      setVolumeHoverV3(undefined)

      setLiquidityHoverSushi(undefined)
      setVolumeHoverSushi(undefined)
    }
  }, [activeNetwork])

  // if hover value undefined, reset to current day value
  useEffect(() => {
    if (!volumeHoverV2 && dataV2) {
      setVolumeHoverV2(dataV2.aquaAmount)
    }
  }, [dataV2, volumeHoverV2])

  useEffect(() => {
    if (!liquidityHoverV2 && dataV2) {
      setLiquidityHoverV2(dataV2.activeTotalValueLockedDrivedUSD)
    }
  }, [liquidityHoverV2, dataV2])

  // if hover value undefined, reset to current day value
  useEffect(() => {
    if (!volumeHoverV3 && dataV3) {
      setVolumeHoverV3(dataV3.aquaAmount)
    }
  }, [dataV3, volumeHoverV3])

  useEffect(() => {
    if (!liquidityHoverV3 && dataV3) {
      setLiquidityHoverV3(dataV3.activeTotalValueLockedDrivedUSD)
    }
  }, [liquidityHoverV3, dataV3])

  // if hover value undefined, reset to current day value
  useEffect(() => {
    if (!volumeHoverSushi && dataSushi) {
      setVolumeHoverSushi(dataSushi.aquaAmount)
    }
  }, [dataSushi, volumeHoverSushi])

  useEffect(() => {
    if (!liquidityHoverSushi && dataSushi) {
      setLiquidityHoverSushi(dataSushi.activeTotalValueLockedDrivedUSD)
    }
  }, [liquidityHoverSushi, dataSushi])

  const activeTVLChartV2 = useMemo(() => {
    if (chartV2) {
      return chartV2.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.activeTotalValueLockedDrivedUSD,
        }
      })
    } else {
      return []
    }
  }, [chartV2])

  const activeTVLChartV3 = useMemo(() => {
    if (chartV3) {
      return chartV3.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.activeTotalValueLockedDrivedUSD,
        }
      })
    } else {
      return []
    }
  }, [chartV3])

  const activeTVLChartSushi = useMemo(() => {
    if (chartSushi) {
      return chartSushi.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.activeTotalValueLockedDrivedUSD,
        }
      })
    } else {
      return []
    }
  }, [chartSushi])

  const aquaPaidChartV2 = useMemo(() => {
    if (chartV2) {
      return chartV2.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.aquaAmount,
        }
      })
    } else {
      return []
    }
  }, [chartV2])

  const aquaPaidChartV3 = useMemo(() => {
    if (chartV3) {
      return chartV3.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.aquaAmount,
        }
      })
    } else {
      return []
    }
  }, [chartV3])

  const aquaPaidChartSushi = useMemo(() => {
    if (chartSushi) {
      return chartSushi.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.aquaAmount,
        }
      })
    } else {
      return []
    }
  }, [chartSushi])

  return (
    <PageWrapper>
      <ThemedBackgroundGlobal backgroundColor="#75cdc9" />
      <AutoColumn gap="16px">
        <TYPE.main>Uniswap V2 Overview</TYPE.main>
        <ResponsiveRow>
          <ChartWrapper>
            <LineChart
              data={activeTVLChartV2}
              height={220}
              minHeight={332}
              color="#75cdc9"
              value={liquidityHoverV2}
              label={leftLabelV2}
              setValue={setLiquidityHoverV2}
              setLabel={setLeftLabelV2}
              topLeft={
                <AutoColumn gap="4px">
                  <TYPE.mediumHeader fontSize="16px">TVL</TYPE.mediumHeader>
                  <TYPE.largeHeader fontSize="32px">
                    <MonoSpace>{formatDollarAmount(liquidityHoverV2, 2, true)} </MonoSpace>
                  </TYPE.largeHeader>
                  <TYPE.main fontSize="12px" height="14px">
                    {leftLabelV2 ? <MonoSpace>{leftLabelV2} (UTC)</MonoSpace> : null}
                  </TYPE.main>
                </AutoColumn>
              }
            />
          </ChartWrapper>
          <ChartWrapper>
            <LineChart
              height={220}
              minHeight={332}
              data={aquaPaidChartV2}
              color="#75cdc9"
              setValue={setVolumeHoverV2}
              setLabel={setRightLabelV2}
              value={volumeHoverV2}
              label={rightLabelV2}
              topLeft={
                <AutoColumn gap="4px">
                  <TYPE.mediumHeader fontSize="16px">Total Reward</TYPE.mediumHeader>
                  <TYPE.largeHeader fontSize="32px">
                    <MonoSpace> {`${formatAmount(volumeHoverV2, 2)} AQUA`}</MonoSpace>
                  </TYPE.largeHeader>
                  <TYPE.main fontSize="12px" height="14px">
                    {rightLabelV2 ? <MonoSpace>{rightLabelV2} (UTC)</MonoSpace> : null}
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
                  <TYPE.label mr="4px">{formatDollarAmount(dataV2?.activeTotalValueLockedDrivedUSD)}</TYPE.label>
                  <Percent value={dataV2?.activeTotalValueLockedDrivedUSDChange} wrap={true} />
                </RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Total Reward: </TYPE.main>
                  <TYPE.label mr="4px">{`${formatAmount(dataV2?.aquaAmount)} AQUA`}</TYPE.label>
                  <Percent value={dataV2?.aquaAmountDrivedUSDChange} wrap={true} />
                </RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Premium Paid: </TYPE.main>
                  <TYPE.label mr="4px">{`${formatAmount(dataV2?.aquaPremiumAmount)} AQUA`}</TYPE.label>
                  <TYPE.main></TYPE.main>
                  <Percent value={dataV2?.aquaPremiumAmountDrivedUSDChange} wrap={true} />
                </RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Active Stakes: </TYPE.main>
                  <TYPE.label mr="4px">{dataV2?.activeStakeCount}</TYPE.label>
                  <TYPE.main></TYPE.main>
                  <Percent value={dataV2?.activeStakeCountChange} wrap={true} />
                </RowFixed>
              </RowFixed>
            </RowBetween>
          </DarkGreyCard>
        </HideSmall>
      </AutoColumn>
      <AutoColumn gap="16px" style={{ marginTop: '15px' }}>
        <TYPE.main>Uniswap V3 Overview</TYPE.main>
        <ResponsiveRow>
          <ChartWrapper>
            <LineChart
              data={activeTVLChartV3}
              height={220}
              minHeight={332}
              color="#75cdc9"
              value={liquidityHoverV3}
              label={leftLabelV3}
              setValue={setLiquidityHoverV3}
              setLabel={setLeftLabelV3}
              topLeft={
                <AutoColumn gap="4px">
                  <TYPE.mediumHeader fontSize="16px">TVL</TYPE.mediumHeader>
                  <TYPE.largeHeader fontSize="32px">
                    <MonoSpace>{formatDollarAmount(liquidityHoverV3, 2, true)} </MonoSpace>
                  </TYPE.largeHeader>
                  <TYPE.main fontSize="12px" height="14px">
                    {leftLabelV3 ? <MonoSpace>{leftLabelV3} (UTC)</MonoSpace> : null}
                  </TYPE.main>
                </AutoColumn>
              }
            />
          </ChartWrapper>
          <ChartWrapper>
            <LineChart
              height={220}
              minHeight={332}
              data={aquaPaidChartV3}
              color="#75cdc9"
              setValue={setVolumeHoverV3}
              setLabel={setRightLabelV3}
              value={volumeHoverV3}
              label={rightLabelV3}
              topLeft={
                <AutoColumn gap="4px">
                  <TYPE.mediumHeader fontSize="16px">Total Reward</TYPE.mediumHeader>
                  <TYPE.largeHeader fontSize="32px">
                    <MonoSpace> {`${formatAmount(volumeHoverV3, 2)} AQUA`}</MonoSpace>
                  </TYPE.largeHeader>
                  <TYPE.main fontSize="12px" height="14px">
                    {rightLabelV3 ? <MonoSpace>{rightLabelV3} (UTC)</MonoSpace> : null}
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
                  <TYPE.label mr="4px">{formatDollarAmount(dataV3?.activeTotalValueLockedDrivedUSD)}</TYPE.label>
                  <Percent value={dataV3?.activeTotalValueLockedDrivedUSDChange} wrap={true} />
                </RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Total Reward: </TYPE.main>
                  <TYPE.label mr="4px">{`${formatAmount(dataV3?.aquaAmount)} AQUA`}</TYPE.label>
                  <Percent value={dataV3?.aquaAmountDrivedUSDChange} wrap={true} />
                </RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Premium Paid: </TYPE.main>
                  <TYPE.label mr="4px">{`${formatAmount(dataV3?.aquaPremiumAmount)} AQUA`}</TYPE.label>
                  <TYPE.main></TYPE.main>
                  <Percent value={dataV3?.aquaPremiumAmountDrivedUSDChange} wrap={true} />
                </RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Active Stakes: </TYPE.main>
                  <TYPE.label mr="4px">{dataV3?.activeStakeCount}</TYPE.label>
                  <TYPE.main></TYPE.main>
                  <Percent value={dataV3?.activeStakeCountChange} wrap={true} />
                </RowFixed>
              </RowFixed>
            </RowBetween>
          </DarkGreyCard>
        </HideSmall>
      </AutoColumn>
      <AutoColumn gap="16px" style={{ marginTop: '15px' }}>
        <TYPE.main>Sushiswap Overview</TYPE.main>
        <ResponsiveRow>
          <ChartWrapper>
            <LineChart
              data={activeTVLChartSushi}
              height={220}
              minHeight={332}
              color="#75cdc9"
              value={liquidityHoverSushi}
              label={leftLabelSushi}
              setValue={setLiquidityHoverSushi}
              setLabel={setLeftLabelSushi}
              topLeft={
                <AutoColumn gap="4px">
                  <TYPE.mediumHeader fontSize="16px">TVL</TYPE.mediumHeader>
                  <TYPE.largeHeader fontSize="32px">
                    <MonoSpace>{formatDollarAmount(liquidityHoverSushi, 2, true)} </MonoSpace>
                  </TYPE.largeHeader>
                  <TYPE.main fontSize="12px" height="14px">
                    {leftLabelSushi ? <MonoSpace>{leftLabelSushi} (UTC)</MonoSpace> : null}
                  </TYPE.main>
                </AutoColumn>
              }
            />
          </ChartWrapper>
          <ChartWrapper>
            <LineChart
              height={220}
              minHeight={332}
              data={aquaPaidChartSushi}
              color="#75cdc9"
              setValue={setVolumeHoverSushi}
              setLabel={setRightLabelSushi}
              value={volumeHoverSushi}
              label={rightLabelSushi}
              topLeft={
                <AutoColumn gap="4px">
                  <TYPE.mediumHeader fontSize="16px">Total Reward</TYPE.mediumHeader>
                  <TYPE.largeHeader fontSize="32px">
                    <MonoSpace> {`${formatAmount(volumeHoverSushi, 2)} AQUA`}</MonoSpace>
                  </TYPE.largeHeader>
                  <TYPE.main fontSize="12px" height="14px">
                    {rightLabelSushi ? <MonoSpace>{rightLabelSushi} (UTC)</MonoSpace> : null}
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
                  <TYPE.label mr="4px">{formatDollarAmount(dataSushi?.activeTotalValueLockedDrivedUSD)}</TYPE.label>
                  <Percent value={dataSushi?.activeTotalValueLockedDrivedUSDChange} wrap={true} />
                </RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Total Reward: </TYPE.main>
                  <TYPE.label mr="4px">{`${formatAmount(dataSushi?.aquaAmount)} AQUA`}</TYPE.label>
                  <Percent value={dataSushi?.aquaAmountDrivedUSDChange} wrap={true} />
                </RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Premium Paid: </TYPE.main>
                  <TYPE.label mr="4px">{`${formatAmount(dataSushi?.aquaPremiumAmount)} AQUA`}</TYPE.label>
                  <Percent value={dataSushi?.aquaPremiumAmountDrivedUSDChange} wrap={true} />
                </RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Active Stakes: </TYPE.main>
                  <TYPE.label mr="4px">{dataSushi?.activeStakeCount}</TYPE.label>
                  <TYPE.main></TYPE.main>
                  <Percent value={dataSushi?.activeStakeCountChange} wrap={true} />
                </RowFixed>
              </RowFixed>
            </RowBetween>
          </DarkGreyCard>
        </HideSmall>
      </AutoColumn>
    </PageWrapper>
  )
}

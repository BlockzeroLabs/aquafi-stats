import React, { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { HideExtraSmall, HideMedium, HideSmall, TYPE } from 'theme'
import { DarkGreyCard, GreyBadge } from 'components/Card'
import Loader, { LoadingRows } from 'components/Loader'
import { AutoColumn } from 'components/Column'
import { RowFixed } from 'components/Row'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { PoolData } from 'state/pools/reducer'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { feeTierPercent } from 'utils'
import { Label, ClickableText } from 'components/Text'
import { PageButtons, Arrow, Break } from 'components/shared'
import { POOL_HIDE } from '../../constants/index'
import useTheme from 'hooks/useTheme'
import { networkPrefix } from 'utils/networkPrefix'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { SupportedNetwork, SUPPORTED_NETWORK_VERSIONS } from 'constants/networks'
import { CONTRACT_ADDRESSES } from 'constants/contracts'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 20px 3.5fr repeat(5, 2fr);

  @media screen and (max-width: 900px) {
    grid-template-columns: 20px 1.5fr repeat(2, 1fr);
    & :nth-child(3) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 20px 1.5fr repeat(1, 0fr);
    & :nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 480px) {
    grid-template-columns: 2.5fr repeat(1, 1fr);
    > *:nth-child(1) {
      display: none;
    }
  }
`

const LinkWrapper = styled(Link)`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const SORT_FIELD = {
  aquaPremium: 'aquaPremium',
  aquaPremiumAmountDrivedUSD: 'aquaPremiumAmountDrivedUSD',
  aquaAmountDrivedUSD: 'aquaAmountDrivedUSD',
  totalValueLockedDrivedUSD: 'totalValueLockedDrivedUSD',
  activeStakeCount: 'activeStakeCount',

  feeTier: 'feeTier',
  volumeUSD: 'volumeUSD',
  tvlUSD: 'tvlUSD',
  volumeUSDWeek: 'volumeUSDWeek',
}

const DataRow = ({ poolData, index }: { poolData: PoolData; index: number }) => {
  const [activeNetwork] = useActiveNetworkVersion()

  return (
    <LinkWrapper to={networkPrefix(activeNetwork) + 'pools/' + poolData.address}>
      <ResponsiveGrid>
        <HideExtraSmall>
          <Label fontWeight={400}>{index + 1}</Label>
        </HideExtraSmall>
        <Label fontWeight={400}>
          <RowFixed>
            <DoubleCurrencyLogo address0={poolData.token0.address} address1={poolData.token1.address} />
            <TYPE.label ml="8px">
              {poolData.token0.symbol}/{poolData.token1.symbol}
            </TYPE.label>
            {activeNetwork.id === SupportedNetwork.UNISWAP_V3 && (
              <GreyBadge ml="10px" fontSize="14px">
                {feeTierPercent(poolData.feeTier)}
              </GreyBadge>
            )}
          </RowFixed>
        </Label>
        <HideExtraSmall>
          <Label end={1} fontWeight={400}>
            {`${poolData.aquaPremium}%`}
          </Label>
        </HideExtraSmall>
        <HideExtraSmall>
          <Label end={1} fontWeight={400}>
            {`${formatAmount(poolData.aquaPremiumAmount)} AQUA`}
          </Label>
        </HideExtraSmall>
        <HideExtraSmall>
          <Label end={1} fontWeight={400}>
            {`${formatAmount(poolData.aquaAmount)} AQUA`}
          </Label>
        </HideExtraSmall>
        <HideExtraSmall>
          <Label end={1} fontWeight={400}>
            {poolData.activeStakeCount}
          </Label>
        </HideExtraSmall>
        <Label end={1} fontWeight={400}>
          {formatDollarAmount(poolData.totalValueLockedDrivedUSD)}
        </Label>
      </ResponsiveGrid>
    </LinkWrapper>
  )
}

const MAX_ITEMS = 10

export default function PoolTable({ poolDatas, maxItems = MAX_ITEMS }: { poolDatas: PoolData[]; maxItems?: number }) {
  // theming
  const theme = useTheme()
  const [activeNetwork] = useActiveNetworkVersion()

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  useEffect(() => {
    let extraPages = 1
    if (poolDatas.length % maxItems === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(poolDatas.length / maxItems) + extraPages)
  }, [maxItems, poolDatas])

  const sortedPools = useMemo(() => {
    return poolDatas
      ? poolDatas
          .filter((x) => !!x && !POOL_HIDE.includes(x.address))
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof PoolData] > b[sortField as keyof PoolData]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            } else {
              return -1
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [maxItems, page, poolDatas, sortDirection, sortField])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField]
  )

  const arrow = useCallback(
    (field: string) => {
      return sortField === field ? (!sortDirection ? '↑' : '↓') : ''
    },
    [sortDirection, sortField]
  )

  if (!poolDatas) {
    return <Loader />
  }

  return (
    <Wrapper>
      {sortedPools.length > 0 ? (
        <AutoColumn gap="16px">
          <ResponsiveGrid>
            <HideExtraSmall>
              <Label color={theme.text2}>#</Label>
            </HideExtraSmall>
            <ClickableText
              color={theme.text2}
              // onClick={() => handleSort(SORT_FIELD.feeTier)}
            >
              Pool
              {/* {arrow(SORT_FIELD.feeTier)} */}
            </ClickableText>
            <HideExtraSmall>
              <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.aquaPremium)}>
                Premium % {arrow(SORT_FIELD.aquaPremium)}
              </ClickableText>
            </HideExtraSmall>
            <HideExtraSmall>
              <ClickableText
                color={theme.text2}
                end={1}
                onClick={() => handleSort(SORT_FIELD.aquaPremiumAmountDrivedUSD)}
              >
                Premium Paid {arrow(SORT_FIELD.aquaPremiumAmountDrivedUSD)}
              </ClickableText>
            </HideExtraSmall>
            <HideExtraSmall>
              <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.aquaAmountDrivedUSD)}>
                Total Reward {arrow(SORT_FIELD.aquaAmountDrivedUSD)}
              </ClickableText>
            </HideExtraSmall>
            <HideExtraSmall>
              <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.activeStakeCount)}>
                Active Stakes {arrow(SORT_FIELD.activeStakeCount)}
              </ClickableText>
            </HideExtraSmall>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.totalValueLockedDrivedUSD)}>
              TVL {arrow(SORT_FIELD.totalValueLockedDrivedUSD)}
            </ClickableText>
          </ResponsiveGrid>
          <Break />
          {sortedPools.map((poolData, i) => {
            if (poolData) {
              return (
                <React.Fragment key={i}>
                  <DataRow index={(page - 1) * MAX_ITEMS + i} poolData={poolData} />
                  <Break />
                </React.Fragment>
              )
            }
            return null
          })}
          <PageButtons>
            <div
              onClick={() => {
                setPage(page === 1 ? page : page - 1)
              }}
            >
              <Arrow faded={page === 1 ? true : false}>←</Arrow>
            </div>
            <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
            <div
              onClick={() => {
                setPage(page === maxPage ? page : page + 1)
              }}
            >
              <Arrow faded={page === maxPage ? true : false}>→</Arrow>
            </div>
          </PageButtons>
        </AutoColumn>
      ) : (
        <LoadingRows>
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </LoadingRows>
      )}
    </Wrapper>
  )
}

import React, { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { DarkGreyCard } from 'components/Card'
import Loader from 'components/Loader'
import { AutoColumn } from 'components/Column'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import { shortenAddress, getEtherscanLink } from 'utils'
import { Label, ClickableText } from 'components/Text'
import { Transaction, TransactionType } from 'types'
import { formatTime } from 'utils/date'
import { RowFixed } from 'components/Row'
import { ExternalLink, TYPE } from 'theme'
import { PageButtons, Arrow, Break } from 'components/shared'
import useTheme from 'hooks/useTheme'
import HoverInlineText from 'components/HoverInlineText'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { OptimismNetworkInfo, SupportedNetwork } from 'constants/networks'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 0.5fr repeat(6, 1fr);

  @media screen and (max-width: 940px) {
    grid-template-columns: 1.5fr repeat(4, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 1.5fr repeat(2, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 1.5fr repeat(1, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
    & > *:nth-child(2) {
      display: none;
    }
  }
`

const ResponsiveGrid2 = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 0.5fr repeat(7, 1fr);

  @media screen and (max-width: 940px) {
    grid-template-columns: 1.5fr repeat(4, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 1.5fr repeat(2, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 1.5fr repeat(1, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
    & > *:nth-child(2) {
      display: none;
    }
  }
`

const SortText = styled.button<{ active: boolean }>`
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  margin-right: 0.75rem !important;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  padding: 0px;
  color: ${({ active, theme }) => (active ? theme.text1 : theme.text3)};
  outline: none;
  @media screen and (max-width: 600px) {
    font-size: 14px;
  }
`

// const SORT_FIELD = {
//   amountUSD: 'amountUSD',
//   timestamp: 'timestamp',
//   sender: 'sender',
//   amountToken0: 'amountToken0',
//   amountToken1: 'amountToken1',
// }

const SORT_FIELD = {
  tokenAmount: 'tokenAmount',
  reserve0: 'reserve0',
  reserve1: 'reserve1',
  totalReservesDrivedUSD: 'totalReservesDrivedUSD',
  aquaPremium: 'aquaPremium',
  aquaPremiumAmount: 'aquaPremiumAmount',
  aquaAmount: 'aquaAmount',
  pool: 'pool',
  staker: 'staker',
  stakeTime: 'stakeTime',
}

const DataRow = ({ transaction, color }: { transaction: Transaction; color?: string }) => {
  const abs0 = Math.abs(transaction.reserve0)
  const abs1 = Math.abs(transaction.reserve1)
  const abs2 = Math.abs(transaction.totalReservesDrivedUSD)
  const abs3 = Math.abs(transaction.aquaPremiumAmount)
  const abs4 = Math.abs(transaction.aquaAmount)
  const abs5 = Math.abs(transaction.aquaPremium)
  // const outputTokenSymbol = transaction.reserve0 < 0 ? transaction.token0.symbol : transaction.token1.symbol
  // const inputTokenSymbol = transaction.reserve1 < 0 ? transaction.token0.symbol : transaction.token1.symbol
  const [activeNetwork] = useActiveNetworkVersion()
  const theme = useTheme()

  return transaction.type === TransactionType.STAKE ? (
    <ResponsiveGrid>
      <Label end={1} fontWeight={400}>
        {activeNetwork.id === SupportedNetwork.UNISWAP_V3
          ? transaction.tokenAmount
          : formatAmount(transaction.tokenAmount)}
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs0)}  ${transaction.token0.symbol}`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs1)}  ${transaction.token1.symbol}`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${formatDollarAmount(abs2)}`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${abs5}%`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        <ExternalLink
          href={getEtherscanLink(
            parseInt(process.env.REACT_APP_CHAIN_ID ?? '1'),
            transaction.account,
            'address',
            activeNetwork
          )}
          style={{ color: '#75cdc9' }}
        >
          {shortenAddress(transaction.account)}
        </ExternalLink>
      </Label>
      <ExternalLink
        href={getEtherscanLink(
          parseInt(process.env.REACT_APP_CHAIN_ID ?? '1'),
          transaction.transactionHash,
          'transaction',
          activeNetwork
        )}
      >
        <Label
          // color={color ?? theme.blue1}
          color="#75cdc9"
          end={1}
          fontWeight={400}
        >
          {formatTime(transaction.timestamp, activeNetwork === OptimismNetworkInfo ? 8 : 0)}
        </Label>
      </ExternalLink>
    </ResponsiveGrid>
  ) : (
    <ResponsiveGrid2>
      <Label end={1} fontWeight={400}>
        {activeNetwork.id === SupportedNetwork.UNISWAP_V3
          ? transaction.tokenAmount
          : formatAmount(transaction.tokenAmount)}
      </Label>
      <Label end={1} fontWeight={400}>
        {`${transaction.token0.symbol}/${transaction.token1.symbol}`}
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${formatDollarAmount(abs2)}`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs3)} AQUA`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs4)} AQUA`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${abs5}%`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        <ExternalLink
          href={getEtherscanLink(
            parseInt(process.env.REACT_APP_CHAIN_ID ?? '1'),
            transaction.account,
            'address',
            activeNetwork
          )}
          // style={{ color: color ?? theme.blue1 }}
          style={{ color: '#75cdc9' }}
        >
          {shortenAddress(transaction.account)}
        </ExternalLink>
      </Label>
      <ExternalLink
        href={getEtherscanLink(
          parseInt(process.env.REACT_APP_CHAIN_ID ?? '1'),
          transaction.transactionHash,
          'transaction',
          activeNetwork
        )}
      >
        <Label
          // color={color ?? theme.blue1}
          color="#75cdc9"
          end={1}
          fontWeight={400}
        >
          {formatTime(transaction.timestamp, activeNetwork === OptimismNetworkInfo ? 8 : 0)}
        </Label>
      </ExternalLink>
    </ResponsiveGrid2>
  )
}

export default function TransactionTable({
  transactions,
  maxItems = 10,
  color,
}: {
  transactions: Transaction[]
  maxItems?: number
  color?: string
}) {
  // theming
  const theme = useTheme()

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.stakeTime)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  const [activeNetwork] = useActiveNetworkVersion()

  useEffect(() => {
    let extraPages = 1
    if (transactions.length % maxItems === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(transactions.length / maxItems) + extraPages)
  }, [maxItems, transactions])

  // filter on txn type
  const [txFilter, setTxFilter] = useState<TransactionType | undefined>(TransactionType.STAKE)

  const sortedTransactions = useMemo(() => {
    return transactions
      ? transactions
          .slice()
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof Transaction] > b[sortField as keyof Transaction]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            } else {
              return -1
            }
          })
          .filter((x) => {
            return txFilter === undefined || x.type === txFilter
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [transactions, maxItems, page, sortField, sortDirection, txFilter])

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

  if (!transactions) {
    return <Loader />
  }

  return (
    <Wrapper>
      <AutoColumn gap="16px">
        <ResponsiveGrid>
          <RowFixed>
            {/* <SortText
              onClick={() => {
                setTxFilter(undefined)
              }}
              active={txFilter === undefined}
            >
              All
            </SortText> */}
            <SortText
              onClick={() => {
                setTxFilter(TransactionType.STAKE)
              }}
              active={txFilter === TransactionType.STAKE}
            >
              {/* <Label color={color ?? theme.blue1}>Stakes</Label> */}
              Stakes
            </SortText>
            <SortText
              onClick={() => {
                setTxFilter(TransactionType.UNSTAKE)
              }}
              active={txFilter === TransactionType.UNSTAKE}
            >
              {/* <Label color={color ?? theme.blue1}>Unstakes</Label> */}
              Unstakes
            </SortText>
          </RowFixed>
        </ResponsiveGrid>

        <Break />

        {txFilter === TransactionType.STAKE ? (
          <ResponsiveGrid>
            <ClickableText color={theme.text2} onClick={() => handleSort(SORT_FIELD.tokenAmount)} end={1}>
              {activeNetwork.id === SupportedNetwork.UNISWAP_V3 ? 'NFT ID' : 'Quantity'} {arrow(SORT_FIELD.tokenAmount)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.reserve0)}>
              Token Amount {arrow(SORT_FIELD.reserve0)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.reserve1)}>
              Token Amount {arrow(SORT_FIELD.reserve1)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.totalReservesDrivedUSD)}>
              Total Value {arrow(SORT_FIELD.totalReservesDrivedUSD)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.aquaPremium)}>
              Premium % {arrow(SORT_FIELD.aquaPremium)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.staker)}>
              Account {arrow(SORT_FIELD.staker)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.stakeTime)}>
              Time {arrow(SORT_FIELD.stakeTime)}
            </ClickableText>
          </ResponsiveGrid>
        ) : (
          <ResponsiveGrid2>
            <ClickableText color={theme.text2} onClick={() => handleSort(SORT_FIELD.tokenAmount)} end={1}>
              {activeNetwork.id === SupportedNetwork.UNISWAP_V3 ? 'NFT ID' : 'Quantity'} {arrow(SORT_FIELD.tokenAmount)}
            </ClickableText>
            <ClickableText color={theme.text2} onClick={() => handleSort(SORT_FIELD.tokenAmount)} end={1}>
              Pool {arrow(SORT_FIELD.tokenAmount)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.totalReservesDrivedUSD)}>
              Total Value {arrow(SORT_FIELD.totalReservesDrivedUSD)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.aquaPremiumAmount)}>
              Premium Paid {arrow(SORT_FIELD.aquaPremiumAmount)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.aquaAmount)}>
              Total Reward {arrow(SORT_FIELD.aquaAmount)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.totalReservesDrivedUSD)}>
              Premium % {arrow(SORT_FIELD.totalReservesDrivedUSD)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.staker)}>
              Account {arrow(SORT_FIELD.staker)}
            </ClickableText>
            <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.stakeTime)}>
              Time {arrow(SORT_FIELD.stakeTime)}
            </ClickableText>
          </ResponsiveGrid2>
        )}

        {/* <ClickableText color={theme.text2} onClick={() => handleSort(SORT_FIELD.tokenAmount)} end={1}>
            Quantity {arrow(SORT_FIELD.tokenAmount)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.reserve0)}>
            Token Amount {arrow(SORT_FIELD.reserve0)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.reserve1)}>
            Token Amount {arrow(SORT_FIELD.reserve1)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.totalReservesDrivedUSD)}>
            Total Value {arrow(SORT_FIELD.totalReservesDrivedUSD)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.staker)}>
            Account {arrow(SORT_FIELD.staker)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.stakeTime)}>
            Time {arrow(SORT_FIELD.stakeTime)}
          </ClickableText> */}

        {/* <Break /> */}

        {sortedTransactions.map((t, i) => {
          if (t) {
            return (
              <React.Fragment key={i}>
                <DataRow transaction={t} color={color} />
                <Break />
              </React.Fragment>
            )
          }
          return null
        })}
        {sortedTransactions.length === 0 ? <TYPE.main>No Transactions</TYPE.main> : undefined}
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
    </Wrapper>
  )
}

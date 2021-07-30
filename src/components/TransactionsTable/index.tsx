import React, { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { DarkGreyCard } from 'components/Card'
import Loader from 'components/Loader'
import { AutoColumn } from 'components/Column'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import { shortenAddress, getEtherscanLink } from 'utils'
import { Label, ClickableText } from 'components/Text'
import { Transaction, V2Transaction, TransactionType } from 'types'
import { formatTime } from 'utils/date'
import { RowFixed } from 'components/Row'
import { ExternalLink, TYPE } from 'theme'
import { PageButtons, Arrow, Break } from 'components/shared'
import useTheme from 'hooks/useTheme'
import HoverInlineText from 'components/HoverInlineText'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 1.5fr repeat(5, 1fr);

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

const SORT_FIELD = {
  pool: {
    feeTier: 'feeTier',
    token0: {
      id: 'id',
      symbol: 'symbol',
    },
    token1: {
      id: 'id',

      symbol: 'symbol',
    },
  },
  tokenId: 'tokenId',
  totalValueLocked: 'totalValueLocked',
  staker: 'staker',
  stakeTime: 'stakeTime',

  // amountUSD: 'amountUSD',
  // timestamp: 'timestamp',
  // sender: 'sender',
  // amountToken0: 'amountToken0',
  // amountToken1: 'amountToken1',
}
const V2_SORT_FIELD = {
  pool: {
    token0: {
      id: 'id',
      symbol: 'symbol',
    },
    token1: {
      id: 'id',

      symbol: 'symbol',
    },
  },
  tokenId: 'tokenId',
  totalValueLocked: 'totalValueLocked',
  staker: 'staker',
  stakeTime: 'stakeTime',

  // amountUSD: 'amountUSD',
  // timestamp: 'timestamp',
  // sender: 'sender',
  // amountToken0: 'amountToken0',
  // amountToken1: 'amountToken1',
}
console.log('SORT FIED=====', SORT_FIELD)
const DataRowV3 = ({ transaction, color }: { transaction: Transaction; color?: string }) => {
  // const abs0 = Math.abs(transaction.amountToken0)
  // const abs1 = Math.abs(transaction.amountToken1)
  // const outputTokenSymbol = transaction.amountToken0 < 0 ? transaction.token0Symbol : transaction.token1Symbol
  // const inputTokenSymbol = transaction.amountToken1 < 0 ? transaction.token0Symbol : transaction.token1Symbol

  const theme = useTheme()

  return (
    <ResponsiveGrid>
      <ExternalLink href={getEtherscanLink(1, transaction.hash, 'transaction')}>
        <Label color={color ?? theme.blue1} fontWeight={400}>
          {
            transaction.type === TransactionType.MINT
              ? `Stake`
              : // : transaction.type === TransactionType.SWAP
                `Unstake`
            // : `Remove ${transaction.pool.token0.symbol} and ${transaction.pool.token1.symbol
          }
        </Label>
      </ExternalLink>

      <Label end={1} fontWeight={400}>
        {parseFloat(transaction.tokenId)}
      </Label>
      <Label end={1} fontWeight={400}>
        {transaction.pool.token0.symbol} / {transaction.pool.token1.symbol}
      </Label>
      <Label end={1} fontWeight={400}>
        {formatDollarAmount(parseFloat(transaction.totalValueLocked))}
      </Label>
      <Label end={1} fontWeight={400}>
        <ExternalLink href={getEtherscanLink(1, transaction.staker, 'address')} style={{ color: color ?? theme.blue1 }}>
          {shortenAddress(transaction.staker)}
        </ExternalLink>
      </Label>
      <Label end={1} fontWeight={400}>
        {formatTime(transaction.stakeTime)}
      </Label>
    </ResponsiveGrid>
  )
}
const DataRowV2 = ({ transaction, color }: { transaction: V2Transaction; color?: string }) => {
  // const abs0 = Math.abs(transaction.amountToken0)
  // const abs1 = Math.abs(transaction.amountToken1)
  // const outputTokenSymbol = transaction.amountToken0 < 0 ? transaction.token0Symbol : transaction.token1Symbol
  // const inputTokenSymbol = transaction.amountToken1 < 0 ? transaction.token0Symbol : transaction.token1Symbol

  const theme = useTheme()

  return (
    <ResponsiveGrid>
      <ExternalLink href={getEtherscanLink(1, transaction.hash, 'transaction')}>
        <Label color={color ?? theme.blue1} fontWeight={400}>
          {
            transaction.type === TransactionType.MINT
              ? `Stake`
              : // : transaction.type === TransactionType.SWAP
                `Unstake`
            // : `Remove ${transaction.pool.token0.symbol} and ${transaction.pool.token1.symbol
          }
        </Label>
      </ExternalLink>

      {/* <Label end={1} fontWeight={400}>
        {parseFloat(transaction.tokenId)}
      </Label> */}
      <Label end={1} fontWeight={400}>
        {transaction.pool.token0.symbol} / {transaction.pool.token1.symbol}
      </Label>
      {/* <Label end={1} fontWeight={400}>
        {formatDollarAmount(parseFloat(transaction.totalValueLocked))}
      </Label> */}
      {/* <Label end={1} fontWeight={400}>
        <ExternalLink
          href={getEtherscanLink(1, '0xCd343942C6D1Dc6734a35d1304f23938d2c41a07', 'address')}
          style={{ color: color ?? theme.blue1 }}
        >
          {shortenAddress('0xCd343942C6D1Dc6734a35d1304f23938d2c41a07')}
        </ExternalLink>
      </Label> */}
      <Label end={1} fontWeight={400}>
        <ExternalLink href={getEtherscanLink(1, transaction.staker, 'address')} style={{ color: color ?? theme.blue1 }}>
          {shortenAddress(transaction.staker)}
        </ExternalLink>
      </Label>
      <Label end={1} fontWeight={400}>
        {formatTime(transaction.stakeTime)}
      </Label>
    </ResponsiveGrid>
  )
}

export function TransactionTableV3({
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

  useEffect(() => {
    let extraPages = 1
    if (transactions.length % maxItems === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(transactions.length / maxItems) + extraPages)
  }, [maxItems, transactions])

  // filter on txn type
  const [txFilter, setTxFilter] = useState<TransactionType | undefined>(undefined)

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
            <SortText
              onClick={() => {
                setTxFilter(undefined)
              }}
              active={txFilter === undefined}
            >
              All
            </SortText>
            {/* <SortText
              onClick={() => {
                setTxFilter(TransactionType.SWAP)
              }}
              active={txFilter === TransactionType.SWAP}
            >
              Swaps
            </SortText> */}
            <SortText
              onClick={() => {
                setTxFilter(TransactionType.MINT)
              }}
              active={txFilter === TransactionType.MINT}
            >
              Stakes
            </SortText>
            <SortText
              onClick={() => {
                setTxFilter(TransactionType.BURN)
              }}
              active={txFilter === TransactionType.BURN}
            >
              Unstakes
            </SortText>
          </RowFixed>
          <ClickableText color={theme.text2} onClick={() => handleSort(SORT_FIELD.tokenId)} end={1}>
            NFT {arrow(SORT_FIELD.tokenId)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1}>
            Pool
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.totalValueLocked)}>
            TVL {arrow(SORT_FIELD.totalValueLocked)}
          </ClickableText>
          {/* <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.amountToken1)}>
            Token Amount {arrow(SORT_FIELD.amountToken1)}
          </ClickableText> */}
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.staker)}>
            Staker {arrow(SORT_FIELD.staker)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.stakeTime)}>
            Time {arrow(SORT_FIELD.stakeTime)}
          </ClickableText>
        </ResponsiveGrid>
        <Break />
        {/* {console.log('SORT txn ======', sortedTransactions)} */}
        {sortedTransactions.map((t, i) => {
          if (t) {
            return (
              <React.Fragment key={i}>
                <DataRowV3 transaction={t} color={color} />
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

export function TransactionTableV2({
  transactions,
  maxItems = 10,
  color,
}: {
  transactions: V2Transaction[]
  maxItems?: number
  color?: string
}) {
  // theming
  const theme = useTheme()

  // for sorting
  const [sortField, setSortField] = useState(V2_SORT_FIELD.stakeTime)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  useEffect(() => {
    let extraPages = 1
    if (transactions.length % maxItems === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(transactions.length / maxItems) + extraPages)
  }, [maxItems, transactions])

  // filter on txn type
  const [txFilter, setTxFilter] = useState<TransactionType | undefined>(undefined)
  // V2_SORT_FIELD change karna hai
  const sortedTransactions = useMemo(() => {
    return transactions
      ? transactions
          .slice()
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof V2Transaction] > b[sortField as keyof V2Transaction]
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
            <SortText
              onClick={() => {
                setTxFilter(undefined)
              }}
              active={txFilter === undefined}
            >
              All
            </SortText>
            {/* <SortText
              onClick={() => {
                setTxFilter(TransactionType.SWAP)
              }}
              active={txFilter === TransactionType.SWAP}
            >
              Swaps
            </SortText> */}
            <SortText
              onClick={() => {
                setTxFilter(TransactionType.MINT)
              }}
              active={txFilter === TransactionType.MINT}
            >
              Stakes
            </SortText>
            <SortText
              onClick={() => {
                setTxFilter(TransactionType.BURN)
              }}
              active={txFilter === TransactionType.BURN}
            >
              Unstakes
            </SortText>
          </RowFixed>
          {/* <ClickableText color={theme.text2} onClick={() => handleSort(V2_SORT_FIELD.tokenId)} end={1}>
            Token Id {arrow(V2_SORT_FIELD.tokenId)}
          </ClickableText> */}
          <ClickableText color={theme.text2} end={1}>
            Pool
          </ClickableText>
          {/* <ClickableText color={theme.text2} end={1} onClick={() => handleSort(V2_SORT_FIELD.totalValueLocked)}>
            TVL {arrow(V2_SORT_FIELD.totalValueLocked)}
          </ClickableText> */}
          {/* <ClickableText color={theme.text2} end={1} onClick={() => handleSort(V2_SORT_FIELD.amountToken1)}>
            Token Amount {arrow(V2_SORT_FIELD.amountToken1)}
          </ClickableText> */}
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(V2_SORT_FIELD.staker)}>
            Staker {arrow(V2_SORT_FIELD.staker)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(V2_SORT_FIELD.stakeTime)}>
            Time {arrow(V2_SORT_FIELD.stakeTime)}
          </ClickableText>
        </ResponsiveGrid>
        <Break />
        {console.log('SORT txn v2222 ======', sortedTransactions)}
        {sortedTransactions.map((t, i) => {
          if (t) {
            return (
              <React.Fragment key={i}>
                <DataRowV2 transaction={t} color={color} />
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

export interface Block {
  number: number
  timestamp: string
}

export interface ChartDayData {
  date: number
  aquaPremiumUSD: number
  tvlUSD: number
}

export enum TransactionType {
  SWAP,
  MINT,
  BURN,
}

export type Transaction = {
  type: TransactionType
  hash: string
  pool: {
    token0: {
      id: string
      symbol: string
    }
    token1: {
      id: string
      symbol: string
    }
  }
  tokenId: string
  totalValueLocked: string
  staker: string
  stakeTime: string
}

/**
 * Formatted type for Candlestick charts
 */
export type PriceChartEntry = {
  time: number // unix timestamp
  open: number
  close: number
  high: number
  low: number
}

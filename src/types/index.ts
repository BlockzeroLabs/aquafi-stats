export interface Block {
  number: number
  timestamp: string
}

export interface ChartDayData {
  date: number

  totalValueLockedDrivedUSD: number

  activeTotalValueLockedDrivedUSD: number

  aquaPremiumAmount: number
  aquaPremiumAmountDrivedUSD: number

  aquaAmount: number
  aquaAmountDrivedUSD: number

  stakeCount: number
  unstakeCount: number
}

export enum TransactionType {
  STAKE,
  UNSTAKE,
}

// export type Transaction = {
//   type: TransactionType
//   hash: string
//   timestamp: string
//   sender: string
//   token0Symbol: string
//   token1Symbol: string
//   token0Address: string
//   token1Address: string
//   amountUSD: number
//   amountToken0: number
//   amountToken1: number
// }

// stakes and unstakes have same field except that unstakes has four extra field,
// those are marked as optional
export type Transaction = {
  type: TransactionType
  id: string
  transactionHash: string
  account: string

  token: string
  tokenAmount: number

  pool: string
  token0: {
    id: string
    symbol: string
  }
  token1: {
    id: string
    symbol: string
  }

  reserve0: number
  reserve1: number

  totalReservesDrivedUSD: number

  aquaPremium: number

  aquaPremiumAmount: number
  aquaPremiumAmountDrivedUSD: number

  aquaAmount: number
  aquaAmountDrivedUSD: number

  timestamp: string
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

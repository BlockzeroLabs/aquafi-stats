// import OPTIMISM_LOGO_URL from '../assets/svg/optimism-plain.svg'
// import ARBITRUM_LOGO_URL from '../assets/images/arbitrum.svg'
// import ETHEREUM_LOGO_URL from '../assets/images/ethereum-logo.png'
import { uniswapV2Client } from 'apollo/client'
import SUSHISWAP_LOGO_URL from '../assets/images/sushiLogo.png'
import UNISWAP_LOGO_URL from '../assets/svg/logo_white.svg'
import AQUAFI_LOGO_URL from '../assets/images/aquaLogo2.png'
import { PROTOCOL_NAMES } from './contracts'

export enum SupportedNetwork {
  UNISWAP_V2,
  UNISWAP_V3,
  SUSHISWAP,
  OVER_VIEW,
}

export type NetworkInfo = {
  id: SupportedNetwork
  name: string
  imageURL: string
  bgColor: string
  primaryColor: string
  secondaryColor: string
  blurb?: string
}

export const EthereumNetworkInfo: NetworkInfo = {
  id: SupportedNetwork.UNISWAP_V2,
  name: PROTOCOL_NAMES.AQUAFI_UNISWAP_V2,
  bgColor: '#75cdc9',
  primaryColor: '#75cdc9',
  secondaryColor: '#fc077d',
  imageURL: UNISWAP_LOGO_URL,
}

export const ArbitrumNetworkInfo: NetworkInfo = {
  id: SupportedNetwork.UNISWAP_V3,
  name: PROTOCOL_NAMES.AQUAFI_UNISWAP_V3,
  imageURL: UNISWAP_LOGO_URL,
  bgColor: '#75cdc9',
  primaryColor: '#75cdc9',
  secondaryColor: '#fc077d',
  blurb: 'L2 Alpha',
}

export const OptimismNetworkInfo: NetworkInfo = {
  id: SupportedNetwork.SUSHISWAP,
  name: PROTOCOL_NAMES.AQUAFI_SUSHISWAP,
  bgColor: '#75cdc9',
  primaryColor: '#75cdc9',
  secondaryColor: '#da6dc2',
  imageURL: SUSHISWAP_LOGO_URL,
  blurb: 'L2 Alpha',
}

export const GlobalNetwork: NetworkInfo = {
  id: SupportedNetwork.OVER_VIEW,
  name: PROTOCOL_NAMES.OVER_VIEW,
  bgColor: '#75cdc9',
  primaryColor: '#75cdc9',
  secondaryColor: '#da6dc2',
  imageURL: AQUAFI_LOGO_URL,
  blurb: 'L2 Alpha',
}

export const SUPPORTED_NETWORK_VERSIONS: NetworkInfo[] = [
  GlobalNetwork,
  EthereumNetworkInfo,
  ArbitrumNetworkInfo,
  OptimismNetworkInfo,
]

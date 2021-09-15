import { EthereumNetworkInfo, GlobalNetwork, NetworkInfo } from 'constants/networks'

export function networkPrefix(activeNewtork: NetworkInfo) {
  const isGlobal = activeNewtork === GlobalNetwork
  if (isGlobal) {
    return '/'
  }
  const prefix = '/' + activeNewtork.name.toLocaleLowerCase() + '/'
  return prefix
}

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../index'
import { useChangeProtocol } from './hooks'
import { updateMatchesDarkMode, changeProtocol } from './actions'

export default function Updater(): null {
  const dispatch = useDispatch<AppDispatch>()
  const [protocol] = useChangeProtocol()

  // keep dark mode in sync with the system
  useEffect(() => {
    // dispatch(changeProtocol('v3'))

    const darkHandler = (match: MediaQueryListEvent) => {
      dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }))
    }

    const match = window?.matchMedia('(prefers-color-scheme: dark)')
    dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }))

    if (match?.addListener) {
      match?.addListener(darkHandler)
    } else if (match?.addEventListener) {
      match?.addEventListener('change', darkHandler)
    }

    return () => {
      if (match?.removeListener) {
        match?.removeListener(darkHandler)
      } else if (match?.removeEventListener) {
        match?.removeEventListener('change', darkHandler)
      }
    }
  }, [dispatch])

  return null
}

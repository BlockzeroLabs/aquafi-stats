import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import application from './application/reducer'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import lists from './lists/reducer'
import multicall from './multicall/reducer'
import { protocol, v2protocol } from './protocol/reducer'
import tokens from './tokens/reducer'
import { pools, v2pools } from './pools/reducer'

const PERSISTED_KEYS: string[] = ['user', 'lists']

const store = configureStore({
  reducer: {
    application,
    user,
    multicall,
    lists,
    protocol,
    v2protocol,
    tokens,
    pools,
    v2pools,
  },
  middleware: [...getDefaultMiddleware({ thunk: false, immutableCheck: false }), save({ states: PERSISTED_KEYS })],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

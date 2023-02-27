import { lazy } from 'react'

export * from './NormalItem'
export const SplitItem = lazy(() => import('./SplitItem'))
export const SplitRemoteItem = lazy(() => import('./SplitRemoteItem'))

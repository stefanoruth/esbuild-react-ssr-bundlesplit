import { lazy } from 'react'

export * from './Home'
export const NotFound = lazy(() => import('./NotFound').then(module => ({ default: module.NotFound })))

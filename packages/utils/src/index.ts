import {nanoid} from 'nanoid'

export * from './request'
export * from './token'
export * from './logger'
export * from './use-peer'
export * from './device'

export const generateId = (prefix?: string) => [prefix, nanoid()].filter(Boolean).join('-')
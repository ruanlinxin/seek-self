import {nanoid} from 'nanoid'
import {isEmpty} from "lodash";

export {default as request} from './request'
export {default as message} from './message'
export {default as db} from './db'
export * as date from './date'

export const genId = (prefix?: string) => [prefix, nanoid()].filter(v => !isEmpty(v)).join('-')

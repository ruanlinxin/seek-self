import {App} from "@/modules/app/type";
import {cloneDeep} from "lodash";
import {generateId} from '@seek-self/utils'
export * from '../loader'


export const defaultWindow: App.window = {
    multi:true,
    resizable: true,
    fullScreenAvailable: true,
    fullScreen: false,
    width: 800,
    height: 500,
}
export const gen = {
    window(extend?: App.entityExtend) {
        const base: App.window = {
            ...defaultWindow,
        }
        if (extend?.window) {
            Object.assign(base, extend.window)
        }
        Object.assign(base, gen.windowCenter(base.width, base.height))
        return base
    },
    windowCenter(width: number, height: number) {
        const _w = window.innerWidth
        const _h = window.innerHeight
        return {
            left: (_w - width) / 2,
            top: (_h - height) / 2,
            width,
            height
        }
    }
}
export const genRunningAppInfo = (entity: App.entity): App.running => {
    const id = generateId('app')
    return {
        id,
        entity: cloneDeep(entity) as App.entity,
        name: entity.name,
        window: gen.window(entity.appExtend)
    }
}

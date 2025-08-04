import {defineStore} from 'pinia';
import {store, usePersistedState} from '@/store';
import screenFull from 'screenfull';
import useEnv from './use-env'

export const useBasicStore = defineStore('basic', () => {
    const env = useEnv()
    const getDictByType = (type: string) => env.dictMap.value[type] || []
    // 字典转下拉数据
    const getDictOptions = (type: string) => computed(() => getDictByType(type).map(item => ({
        label: item.key,
        value: item.value
    })))
    // 字典翻译
    const getDictTranslate = (type: string, value: string) => computed(() => getDictByType(type).find(item => item.value === value)?.key || '')

    const _state = usePersistedState('basic')
    const setting = reactive(Object.assign({
        // 平均死亡年龄
        meanAgeAtDeath: [0, 79, 73],
        sideLock: true,
        fullScreen: false
    }, _state.getState()))
    setting.fullScreen = screenFull.isFullscreen
    watchEffect(() => {
        _state.syncState(setting)
    })
    const fullScreenToggle = () => {
        if (screenFull.isFullscreen) {
            setting.fullScreen = false
            screenFull.exit();
        } else {
            setting.fullScreen = true
            screenFull.request();
        }
    }

    const lockToggle = () => {
        setting.sideLock = !setting.sideLock
    }

    return {
        env,
        getDictByType,
        getDictOptions,
        getDictTranslate,
        lockToggle,
        fullScreenToggle,
        setting
    }
})

export const getBasicStore = () => {
    return useBasicStore(store);
}

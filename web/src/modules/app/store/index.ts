import {defineStore} from 'pinia';

import {getAppList} from '@seek-self/api'

import {getUserStore, store} from '@/store';
import {genRunningAppInfo} from '@/modules/app/meta';
import {App} from "@/modules/app/type";
import {UserAppRelationAPI}  from '@seek-self/api/src/user'


export const useAppsStore = defineStore('apps', () => {
    const appList = ref<App.entity[]>([])
    const appMap = ref<Record<string, App.entity>>({})
    const loading = ref(false)
    const loadAppList = () => {
        if (loading.value) return Promise.resolve()
        loading.value = true
        appList.value = []
        return getAppList().then(res => {
            res.data.forEach(app => {
                appMap.value[app.name] = app
            })
            appList.value = res.data
        }).finally(() => {
            loading.value = false
        })
    }
    const idMap = ref<Record<string, App.running>>({})
    const list = computed(() => Object.values(idMap.value))
    const open = (entity: App.entity) => {
        if (!entity?.appExtend?.window?.multi) {
            const item = list.value.find(item => item.entity.id === entity.id)
            if (item) return item.id
        }
        entity.usedAt = new Date().toISOString()
        const appRunningInfo = genRunningAppInfo(entity)
        if (appRunningInfo) {
            const {id} = appRunningInfo
            idMap.value[id] = appRunningInfo
            const userId = getUserStore()?.profile?.userId
            if (userId) {
                UserAppRelationAPI.recordUsed(entity.id)
            }
            return id
        }
        return null
    }

    const close = (id: string) => {
        delete idMap.value[id]
    }
    const toggleStar = (entity: App.entity) => {
        entity.favoriteAt = entity.favoriteAt ? null : new Date().toISOString()
        if (entity.favoriteAt) {
            UserAppRelationAPI.favorite(entity.id)
        } else {
            UserAppRelationAPI.unfavorite(entity.id)
        }
    }

    return {
        appList,
        loadAppList,
        list,
        idMap,
        open,
        close,
        toggleStar,
    }
})

export const getAppsStore = () => {
    return useAppsStore(store);
}

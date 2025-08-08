import {Icon} from '@arco-design/web-vue'
import NotFound from './not-found.vue'
import * as Vue from 'vue'
import {loadModule} from 'vue3-sfc-loader'
import {App} from "@/modules/app/type";
import * as hooks from '@/hooks'
import * as arco from '@arco-design/web-vue';
import * as nanoid from 'nanoid'

const options = {
    moduleCache: {
        vue: Vue,
        'hooks':hooks,
        '@arco-design/web-vue': arco,
        nanoid:nanoid
    },
    async getFile(url) {
        const res = await fetch(url);
        if (!res.ok)
            throw Object.assign(new Error(res.statusText + ' ' + url), {res});
        return {
            getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text(),
        }
    },
    addStyle(textContent) {
        const style = Object.assign(document.createElement('style'), {textContent});
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
    },
}


const map = {
    loginRegister: createAsyncComponent(() => import('@/desktop/side/avatar/login-register.vue')),
    userProfile: createAsyncComponent(() => import('@/desktop/side/avatar/user-profile.vue')),
    appManage: createAsyncComponent(() => import('@/modules/app/items/app-manage/index.vue')),
    dataDict: createAsyncComponent(() => import('@/modules/app/items/data-dictionary/index.vue')),
    randomChar: createAsyncComponent(() => import('@/modules/app/items/random-char/index.vue')),
    p2p:createAsyncComponent(() => import('@/modules/app/items/p2p/index.vue')),
}
export const componentKeys = Object.keys(map)
type MapKeys = keyof typeof map

export function createAsyncComponent(loader: Fn, options = {}) {
    return defineAsyncComponent({
        loader,
        loadingComponent: <Icon type="sync" spin style={'font-size:199px'}/>,
        timeout: 10000,
        onError(e) {
            console.log(e)
        }
    })
}

export const getAsyncComponent = (entity: App.entity | string) => {
    const appType = typeof entity === 'string' ? 'native' : entity.appType
    const key = typeof entity === 'string' ? entity : entity.componentKey
    switch (appType) {
        case 'native':
            return map[key as MapKeys] || NotFound
        case 'sfcNative':
            return createAsyncComponent(() => loadModule(key,options))
        default:
            return NotFound
    }
}

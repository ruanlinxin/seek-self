import {loadModule} from 'vue3-sfc-loader'
import moduleCache from './module-cache'
import NativeAppMap from '@/modules/app/items'
import {Icon} from "@arco-design/web-vue";
import {App} from "@/modules/app/type";
import NotFound from "@/views/not-found.vue";
import {Options} from "vue3-sfc-loader/dist/types/vue3-esm/types";

const options:Options = {
    moduleCache,
    async getFile(url) {
        const res = await fetch(url);
        if (!res.ok)
            throw Object.assign(new Error(res.statusText + ' ' + url), {res});
        return {
            getContentData: (asBinary: Promise<ArrayBuffer> | Promise<string>) => asBinary ? res.arrayBuffer() : res.text(),
        }
    },
    addStyle(textContent: string) {
        const style = Object.assign(document.createElement('style'), {textContent});
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
    },
}

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


export const componentKeys = Object.keys(NativeAppMap)
type MapKeys = keyof typeof NativeAppMap

export const getAsyncComponent = (entity: App.entity | string) => {
    const appType = typeof entity === 'string' ? 'native' : entity.appType
    const key = typeof entity === 'string' ? entity : entity.componentKey
    switch (appType) {
        case 'native':
            return NativeAppMap[key as MapKeys] ? createAsyncComponent(NativeAppMap[key as MapKeys]) : NotFound
        case 'sfcNative':
            return createAsyncComponent(() => loadModule(`https://raw.githubusercontent.com/ruanlinxin/seek-self/refs/heads/${key}`, options))
        case 'customSfcNative':
            return createAsyncComponent(() => loadModule(key, options))
        default:
            return NotFound
    }
}

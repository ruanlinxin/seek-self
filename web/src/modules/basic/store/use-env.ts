import {EnvAPI} from '@seek-self/api/src/env/'
import type { Dict } from '@seek-self/types/src/modules/env'

export default function () {
    const dictMap = ref<Record<string, Dict[]>>({})
    const background = ref('')
    const reload = () => {
        return EnvAPI.getSummary().then(res => {
            const _dictMap: Record<string, Dict[]> = {}
            const {dicts,todayBingImage} = res.data
            dicts.forEach(item => {
                if (!(item.type in _dictMap)) {
                    _dictMap[item.type] = []
                }
                _dictMap[item.type].push(item)
            })
            dictMap.value = _dictMap
            background.value = `url("${todayBingImage.fullUrl}")`
        })
    }
    reload()
    return {
        background,
        dictMap,
        reload
    }
}

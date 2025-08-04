import {request} from "@/tools";

const getEnv = (): Result<{
    dicts: DictEntity[]
}> => request.get('/env/summary')

interface DictEntity {
    id: string
    key: string
    value: string
    type: string
    description: string
    orderNo: number
    enabled: boolean
}


export default function () {
    const dictMap = ref<Record<string, DictEntity[]>>({})
    const reload = () => {
        return getEnv().then(res => {
            const _dictMap: Record<string, DictEntity[]> = {}
            const {dicts} = res.data
            dicts.forEach(item => {
                if (!(item.type in _dictMap)) {
                    _dictMap[item.type] = []
                }
                _dictMap[item.type].push(item)
            })
            dictMap.value = _dictMap
        })
    }
    reload()
    return {
        dictMap,
        reload
    }
}

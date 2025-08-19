import {request} from "@/tools";

const getEnv = (): Result<{
    dicts: DictEntity[]
    todayBingImage:{
        fullUrl:string
        [index:string]: any
    }
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
    const background = ref('')
    const reload = () => {
        return getEnv().then(res => {
            const _dictMap: Record<string, DictEntity[]> = {}
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

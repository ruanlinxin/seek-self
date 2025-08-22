import { initEvent } from '@seek-self/api'
import { logger } from '@seek-self/utils'

const onSuccess = ()=>{
}
const onError = ()=>{
}
export default function(){
    initEvent(onSuccess,onError)
}
import {initRequest} from '@seek-self/api'
import {logger} from '@seek-self/utils'
import {getEnvByKey} from "@/tools/env";
import {Message} from '@arco-design/web-vue';
import { debounce } from  'lodash'
const UnauthorizedMessage = debounce(()=>{
    Message.error('请登录后操作')
},200)
const onSuccess = () => {
}
const onError = (e) => {
    const  res = e.data
    switch (res.code){
        case 401:
            UnauthorizedMessage()
            return
        default:
            Message.error(res.message)
            return;
    }
}
export default function () {
    initRequest({
        onSuccess,
        onError,
        baseURL: getEnvByKey('requestUrlPrefix')
    })
}

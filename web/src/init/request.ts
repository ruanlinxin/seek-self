import {initRequest} from '@seek-self/api'
import {logger} from '@seek-self/utils'
import {getEnvByKey} from "@/tools/env";

const onSuccess = () => {
}
const onError = () => {
}
export default function () {
    initRequest({
        onSuccess,
        onError,
        baseURL: getEnvByKey('requestUrlPrefix')
    })
}

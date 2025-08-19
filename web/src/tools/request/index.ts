import { createRequest } from '@seek-self/utils/'
import {getEnvByKey} from "@/tools/env";
import Message from '../message'

const request = createRequest({
    baseURL: getEnvByKey('requestUrlPrefix')
}, {
    onIsErrorCode(response) {
        const message = response?.data?.message
        if (!message) return
        if (Array.isArray(message)) {
            Message.error(message.join(','))
        }
        if (typeof message === 'string') {
            Message.error(message)
        }
    }
})
export default request

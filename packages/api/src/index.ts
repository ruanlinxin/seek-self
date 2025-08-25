import {AxiosResponse} from 'axios'
import {createRequest} from '@seek-self/utils/src/request'

type reqEvent = (response: AxiosResponse) => void

const onErrorList: reqEvent[] = []
const onSuccessList: reqEvent[] = []


export const initRequest = (options?: {
    baseURL?: string
    onSuccess?: reqEvent,
    onError?: reqEvent
}) => {
    if(options){
        const {baseURL,onSuccess,onError} =  options
        baseURL && (request.defaults.baseURL = baseURL)
        onSuccess && onSuccessList.push(onSuccess)
        onError && onErrorList.push(onError)
    }
}

export const request = createRequest({}, {
    onIsErrorCode(response) {
        onErrorList.forEach(fn => fn(response))
    },
    onIsSuccessCode(response) {
        onSuccessList.forEach(fn => fn(response))
    },
})

// 导出应用 API
export * from './app';
// 导出设备 API
export * from './device';
// 导出环境 API
export * from './env';
// 导出用户 API
export * from './user';

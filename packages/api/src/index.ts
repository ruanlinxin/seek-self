import { AxiosResponse } from 'axios'
import { createRequest } from '@seek-self/utils/src/request'

type reqEvent = (response:AxiosResponse) => void

const onErrorList:reqEvent[] = []
const onSuccessList:reqEvent[] = []


export const initEvent = (onSuccess:reqEvent,onError:reqEvent)=>{
  onSuccessList.push(onSuccess)
  onErrorList.push(onError)
}

export const request = createRequest({},{
  onIsErrorCode(response) {
    onErrorList.forEach(fn=> fn(response))
  },
  onIsSuccessCode(response) {
    onSuccessList.forEach(fn=> fn(response))
  },
})

// 导出设备 API
export * from './device';
// 导出环境 API
export * from './env';
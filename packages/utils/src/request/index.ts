import axios, {AxiosResponse, CreateAxiosDefaults} from 'axios'
import {token} from "../token";

interface RequestEvents {
    onIsSuccessCode?: (response:AxiosResponse) => void
    onIsErrorCode?: (response:AxiosResponse) => void
}

const isSuccessCode = (code: number) => [200].includes(code)


export const createRequest = (option: CreateAxiosDefaults, events?: RequestEvents) => {
    const base = {
        timeout: 10 * 1000
    }
    const _axios = axios.create({
        ...base,
        ...option,
    })
    _axios.interceptors.request.use(config => {
        const _token = token.get()
        if (_token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })
    _axios.interceptors.response.use(response => {
        const {data} = response
        if (isSuccessCode(data.code)){
            events?.onIsSuccessCode?.(data.code)
            return Promise.resolve(data)
        }
        events?.onIsErrorCode?.(response)
        return Promise.reject(data)
    })

    return _axios
}

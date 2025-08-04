import axios from "axios";
import {getEnvByKey} from "@/tools/env";
import {db, message} from "@/tools";

const request = axios.create({
    timeout: 10000,
    baseURL: getEnvByKey('requestUrlPrefix')
})
request.interceptors.request.use(config => {
    const token = db.token.getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
request.interceptors.response.use(
    (res) => {
        const {data} = res
        if (!isSuccessCode(data.code)) {
            if (Array.isArray(data.message)) {
                message.error(data.message.join(','))
            }
            if (typeof data.message === 'string') {
                message.error(data.message)
            }
            return Promise.reject(data)
        }
        return Promise.resolve(data)
    },
    (err) => {
        console.log('errpr')

    }
)


const isSuccessCode = (code: number) => [200].includes(code)

export default request

import {generateId} from '../index'

const key = 'seek-self-device-id'
export const getDeviceId = () => {
    let deviceId = localStorage.getItem(key)
    if(!deviceId){
        deviceId = generateId(key)
        localStorage.setItem(key,deviceId)
    }
    return deviceId
}
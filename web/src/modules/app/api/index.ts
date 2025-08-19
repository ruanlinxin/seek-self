import {request} from "@/tools";
import {App} from "@/modules/app/type";


export const createApp = (data: App.entity) => request.post('/app', data)
export const updateApp = (id: string, data: App.entity) => request.patch(`/app/${id}`, data)
export const getAllApp = () => request.get('/app')
export const deleteApp = (id: string) => request.delete(`/app/${id}`)

export const getAppList = (): Result<App.entity[]> => request.get('/app/box')

import {request} from "@/tools";
import {App} from "@/modules/app/type";

export const getDictTypeList = (type:string) => request.get(`/env/dict/type/${type}`)

export const createDict = (data: App.entity) => request.post('/env/dict/', data)
export const updateDict = (id: string, data: App.entity) => request.patch(`/env/dict//${id}`, data)
export const deleteDict = (id: string) => request.delete(`/env/dict/${id}`)

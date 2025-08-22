import request from "@/tools/request";





export const recentApps = (appId?: string) => request.post('/user-app-relation/used', {appId})

export const favoriteApps = (appId?: string) => request.post('/user-app-relation/favorite', {appId})
export const unFavoriteApps = (appId?: string) => request.post('/user-app-relation/unFavorite', {appId})

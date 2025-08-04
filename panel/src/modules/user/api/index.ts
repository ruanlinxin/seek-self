import request from "@/tools/request";


export const register = (data: {
    username: string,
    password: string
}): Result => request.post('/user/register', data)

export const login = (data: {
    username: string,
    password: string
}): Result<{
    access_token: string
}> => request.post('/user/login', data)

export const getUserInfo = (): Result<{
    profile: {
        userId: string,
        nickname: string,
        avatar?: string,
        gender: number,
        bio?: string,
        birth?: string,
    }
}> => request.get('/user/profile')

export const updateProfile = (data: object) => request.patch('/user/profile', data)


export const recentApps = (appId?: string) => request.post('/user-app-relation/used', {appId})

export const favoriteApps = (appId?: string) => request.post('/user-app-relation/favorite', {appId})
export const unFavoriteApps = (appId?: string) => request.post('/user-app-relation/unFavorite', {appId})

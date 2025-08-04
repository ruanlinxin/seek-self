import {defineStore} from 'pinia';
import {store} from '@/store';
import {db} from '@/tools'
import {getUserInfo} from "@/modules/user/api";

export const defaultProfile = () => ({
    userId: '',
    nickname: '',
    avatar: '',
    gender: 0,
    birth: '',
    bio: ''
})
export const useUserStore = defineStore('user', () => {
    const token = ref()
    const profile = ref(defaultProfile())
    watchEffect(() => {
        const t = token.value
        if (t) {
            getUserInfo().then(res => {
                profile.value = res.data.profile as typeof profile.value
            }).catch(() => {
                db.token.clearToken()
                token.value = null
                profile.value = defaultProfile()
            })
        } else {
            profile.value = defaultProfile()
        }
    })
    const info = reactive({
        // 生日 年-月-日
        birth: '1996-06-12',
        // 性别 0 女 1 男
        sex: 1,
    })
    const setToken = (t: string) => {
        db.token.setToken(t)
        token.value = t
    }
    const logout = () => {
        db.token.clearToken()
        token.value = null
        profile.value = defaultProfile()
    }
    const startToken = db.token.getToken()
    if (startToken) {
        token.value = startToken
    }
    return {
        token,
        info,
        profile,
        setToken,
        logout,
    }
})

export const getUserStore = () => {
    return useUserStore(store);
}

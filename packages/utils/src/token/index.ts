
const key = 'seek-self-token-user'

export const token = {
    get() {
        return localStorage.getItem(key)
    },
    set(token: string) {
        localStorage.setItem(key, token)
    },
    remove() {
        localStorage.removeItem(key)
    }
}

const env = {
    requestUrlPrefix: import.meta.env.VITE_API_URL_PREFIX,
}

export const getEnvByKey = (key: keyof typeof env) => env[key]

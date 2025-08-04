import {ConfigEnv, UserConfig, loadEnv} from 'vite';
import createVuePlugin from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';
import AutoImport from 'unplugin-auto-import/vite'; // 引入自动引入插件
import {codeInspectorPlugin} from 'code-inspector-plugin';

import path from 'path';

const CWD = process.cwd();

// https://vitejs.dev/config/
export default ({mode}: ConfigEnv): UserConfig => {
    const {VITE_BASE_URL, VITE_PROXY_URL, VITE_API_URL_PREFIX} = loadEnv(mode, CWD);
    return {
        base: VITE_BASE_URL,
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        define: {
            __APP_ENV__: JSON.stringify(process.env.VITE_API_URL)
        },
        plugins: [
            codeInspectorPlugin({
                bundler: 'vite',
                editor: 'webstorm',
            }),
            createVuePlugin(),
            vueJsx(),
            svgLoader(),
            AutoImport({
                imports: [
                    'vue',
                    'vue-router',
                ],
                dts: 'src/auto-import.d.ts',
                eslintrc: {
                    enabled: true,
                },
            }),
        ],
        server: {
            proxy: {
                [VITE_API_URL_PREFIX]: {
                    target: VITE_PROXY_URL,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            }
        }
    };
};

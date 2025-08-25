import {getDeviceId, logger} from '@seek-self/utils';
import {setDeviceOnline} from '@seek-self/api';
import {DeviceType, Platform, RegisterDeviceDto} from '@seek-self/types/src/modules/device';

// 创建设备模块专用日志器
const deviceLogger = logger.child('Device');

/**
 * 获取浏览器设备信息
 */
function getDeviceInfo(): RegisterDeviceDto {
    const deviceId = getDeviceId();

    // 获取基础设备信息
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;

    // 获取屏幕信息
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const devicePixelRatio = window.devicePixelRatio;

    // 获取时区信息
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // 检测触摸支持
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // 获取CPU核心数
    const cpuCores = navigator.hardwareConcurrency;

    // 获取内存信息（如果支持）
    let totalMemory: number | undefined;
    if ('memory' in performance) {
        const memory = (performance as any).memory;
        totalMemory = memory.jsHeapSizeLimit ? Math.round(memory.jsHeapSizeLimit / 1024 / 1024) : undefined;
    }

    // 获取网络信息（如果支持）
    let networkType: string | undefined;
    if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        networkType = connection?.effectiveType || connection?.type;
    }

    // 获取屏幕方向
    let screenOrientation: string | undefined;
    if (screen.orientation) {
        screenOrientation = screen.orientation.type;
    } else if ('orientation' in window) {
        screenOrientation = Math.abs(window.orientation as number) === 90 ? 'landscape' : 'portrait';
    }

    // 解析浏览器信息
    const getBrowserInfo = () => {
        const ua = userAgent.toLowerCase();
        let browserName = 'unknown';
        let browserVersion = 'unknown';

        if (ua.includes('chrome') && !ua.includes('edg')) {
            browserName = 'Chrome';
            const match = ua.match(/chrome\/(\d+\.\d+)/);
            browserVersion = match ? match[1] : 'unknown';
        } else if (ua.includes('firefox')) {
            browserName = 'Firefox';
            const match = ua.match(/firefox\/(\d+\.\d+)/);
            browserVersion = match ? match[1] : 'unknown';
        } else if (ua.includes('safari') && !ua.includes('chrome')) {
            browserName = 'Safari';
            const match = ua.match(/version\/(\d+\.\d+)/);
            browserVersion = match ? match[1] : 'unknown';
        } else if (ua.includes('edg')) {
            browserName = 'Edge';
            const match = ua.match(/edg\/(\d+\.\d+)/);
            browserVersion = match ? match[1] : 'unknown';
        }

        return {browserName, browserVersion};
    };

    // 解析操作系统信息
    const getOSInfo = () => {
        const ua = userAgent.toLowerCase();
        let osName = 'unknown';
        let osVersion = 'unknown';

        if (ua.includes('windows')) {
            osName = 'Windows';
            if (ua.includes('windows nt 10')) osVersion = '10';
            else if (ua.includes('windows nt 6.3')) osVersion = '8.1';
            else if (ua.includes('windows nt 6.2')) osVersion = '8';
            else if (ua.includes('windows nt 6.1')) osVersion = '7';
        } else if (ua.includes('mac os x')) {
            osName = 'macOS';
            const match = ua.match(/mac os x (\d+_\d+)/);
            osVersion = match ? match[1].replace('_', '.') : 'unknown';
        } else if (ua.includes('linux')) {
            osName = 'Linux';
        } else if (ua.includes('android')) {
            osName = 'Android';
            const match = ua.match(/android (\d+\.\d+)/);
            osVersion = match ? match[1] : 'unknown';
        } else if (ua.includes('iphone') || ua.includes('ipad')) {
            osName = 'iOS';
            const match = ua.match(/os (\d+_\d+)/);
            osVersion = match ? match[1].replace('_', '.') : 'unknown';
        }

        return {osName, osVersion};
    };

    // 获取平台信息
    const getPlatform = (): Platform => {
        const ua = userAgent.toLowerCase();
        if (ua.includes('android')) return Platform.ANDROID;
        if (ua.includes('iphone') || ua.includes('ipad')) return Platform.IOS;
        if (ua.includes('windows')) return Platform.WINDOWS;
        if (ua.includes('mac')) return Platform.MACOS;
        if (ua.includes('linux')) return Platform.LINUX;
        return Platform.WEB;
    };

    const {browserName, browserVersion} = getBrowserInfo();
    const {osName, osVersion} = getOSInfo();
    const devicePlatform = getPlatform();

    // 获取应用版本信息（可从环境变量或包文件获取）
    const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
    const appBuildVersion = import.meta.env.VITE_APP_BUILD_VERSION || Date.now().toString();

    return {
        deviceId,
        deviceType: DeviceType.BROWSER,
        platform: devicePlatform,
        deviceName: `${browserName} on ${osName}`,
        deviceBrand: browserName,
        osName,
        osVersion,
        architecture: platform,
        browserName,
        browserVersion,
        userAgent,
        screenWidth,
        screenHeight,
        devicePixelRatio,
        screenOrientation,
        touchSupport,
        cpuCores,
        totalMemory,
        networkType,
        appVersion,
        appBuildVersion,
        language,
        timezone,
        extendInfo: {
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth
        }
    };
}

/**
 * 设备初始化和上报
 */
export default function initDevice(): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const deviceInfo = getDeviceInfo();

                deviceLogger.info('开始上报设备信息', {
                    deviceId: deviceInfo.deviceId,
                    deviceType: deviceInfo.deviceType,
                    platform: deviceInfo.platform,
                    deviceName: deviceInfo.deviceName,
                    osName: deviceInfo.osName,
                    osVersion: deviceInfo.osVersion,
                    browserName: deviceInfo.browserName,
                    browserVersion: deviceInfo.browserVersion
                });

                // 记录请求详细信息
                deviceLogger.debug('设备信息详情', {
                    fullDeviceInfo: deviceInfo,
                    requestUrl: `/device/${deviceInfo.deviceId}/online`,
                    requestMethod: 'POST'
                });

                // 调用设备上线 API（带自动注册）
                const startTime = performance.now();
                const result = await setDeviceOnline(deviceInfo.deviceId, deviceInfo);
                const endTime = performance.now();
                
                deviceLogger.debug('设备上报响应详情', {
                    requestDuration: `${(endTime - startTime).toFixed(2)}ms`,
                    responseCode: result.code,
                    responseMessage: result.message,
                    responseTimestamp: result.timestamp,
                    dataExists: result.data !== null && result.data !== undefined,
                    dataType: typeof result.data,
                    dataKeys: result.data && typeof result.data === 'object' ? Object.keys(result.data) : null,
                    fullResponse: result
                });

                if (result.code === 200 || result.code === 201) {
                    deviceLogger.info('设备信息上报成功', {
                        deviceId: deviceInfo.deviceId,
                        responseCode: result.code,
                        savedDeviceId: (result.data as any)?.deviceId,
                        savedDeviceType: (result.data as any)?.deviceType,
                        isOnline: (result.data as any)?.isOnline,
                        lastActiveAt: (result.data as any)?.lastActiveAt,
                        createdAt: (result.data as any)?.createdAt,
                        updatedAt: (result.data as any)?.updatedAt
                    });
                    resolve();
                } else {
                    deviceLogger.error('设备信息上报失败', {
                        code: result.code,
                        message: result.message,
                        timestamp: result.timestamp,
                        deviceId: deviceInfo.deviceId,
                        possibleCauses: [
                            '后端服务未运行',
                            'JWT token无效或过期',
                            '数据库连接问题',
                            '设备信息验证失败'
                        ]
                    });
                    reject(new Error(result.message));
                }
            } catch (error) {
                const errorInfo = {
                    errorMessage: error.message || error,
                    errorName: error.name,
                    errorStack: error.stack,
                    errorCode: error.code,
                    responseStatus: error.response?.status,
                    responseData: error.response?.data,
                    isNetworkError: !error.response,
                    timestamp: new Date().toISOString()
                };
                
                deviceLogger.error('设备信息上报异常', errorInfo);
                
                // 提供错误分析
                if (errorInfo.responseStatus === 401) {
                    deviceLogger.error('认证失败 - 请检查用户是否已登录', {
                        suggestion: '用户可能未登录或token已过期，请重新登录'
                    });
                } else if (errorInfo.responseStatus === 500) {
                    deviceLogger.error('服务器内部错误 - 后端处理异常', {
                        suggestion: '检查后端日志以获取详细错误信息',
                        serverError: errorInfo.responseData
                    });
                } else if (errorInfo.isNetworkError) {
                    deviceLogger.error('网络连接错误 - 无法连接到后端', {
                        suggestion: '检查后端服务是否运行，网络是否正常'
                    });
                }
                
                reject(error);
            }
        }, 2000);
    });
}

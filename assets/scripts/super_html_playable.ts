/**
 * super-html playable adapter
 * @help https://store.cocos.com/app/detail/3657
 * @home https://github.com/magician-f/cocos-playable-demo
 * @author https://github.com/magician-f
 */

import { sys } from "cc";

declare global {
    interface Window {
        APP_STORE_URL?: string;
        GOOGLE_PLAY_URL?: string;
        LINKACTIVE?: boolean;
    }
}

// Ссылки на магазины приложений
const APP_STORE_URL = "https://apps.apple.com/us/app/tomb-of-the-mask-pixel-maze/id1057889290";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?gl=US&hl=en-US&id=com.playgendary.tom";

export class super_html_playable {

    /**
     * Определяет тип устройства (iOS или Android)
     */
    private getPlatform(): string {
    // Для нативных платформ (мобильные приложения)
    if (sys.isNative) {
        if (sys.os === sys.OS.ANDROID) {
            return 'android';
        } else if (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX) {
            // iOS и macOS определяем как iOS для редиректа в App Store
            return 'ios';
        }
    }
    
    // Для веб-версий (анализ userAgent)
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) {
        return 'android';
    } else if (userAgent.includes('iphone') || 
              userAgent.includes('ipad') || 
              userAgent.includes('ipod') ||
              userAgent.includes('macintosh')) {
        // Добавляем macintosh для macOS - тоже ведем в App Store
        return 'ios';
    }
    
    // По умолчанию для всего остального (Windows, Linux и т.д.) - Android
    return 'android';
}

    /**
     * Безопасное открытие ссылки (обход блокировки всплывающих окон)
     */
    private safeWindowOpen(url: string): void {
        try {
            const newWindow = window.open(url, '_blank');
            if (newWindow === null || newWindow.closed) {
                // Если всплывающее окно заблокировано, используем обходной метод
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("Error opening URL:", error);
            // Последняя попытка - просто переходим по ссылке
            window.location.href = url;
        }
    }

    download() {
        console.log("download");
        
        const platform = this.getPlatform();
        let targetUrl = GOOGLE_PLAY_URL; // По умолчанию Android
        
        // Определяем нужную ссылку
        if (platform === 'ios') {
            targetUrl = window.APP_STORE_URL || APP_STORE_URL;
            this.set_app_store_url(APP_STORE_URL);
        } else {
            targetUrl = window.GOOGLE_PLAY_URL || GOOGLE_PLAY_URL;
            this.set_google_play_url(GOOGLE_PLAY_URL);
        }
        
        console.log(`Opening store for ${platform}: ${targetUrl}`);
        if (targetUrl != '')
        this.safeWindowOpen(targetUrl);
        
        // Вызываем нативный метод, если доступен
        //@ts-ignore
        window.super_html && super_html.download();
    }

    game_end() {
        console.log("game end");
        this.set_google_play_url(window.GOOGLE_PLAY_URL || GOOGLE_PLAY_URL);
        //@ts-ignore
        window.super_html && super_html.game_end();
    }

    /**
     * 是否隐藏下载按钮，意味着使用平台注入的下载按钮
     * channel : google
     */
    is_hide_download() {
        //@ts-ignore
        if (window.super_html && super_html.is_hide_download) {
            //@ts-ignore
            return super_html.is_hide_download();
        }
        return false;
    }

    /**
     * 设置商店地址
     * channel : unity
     * @param url https://play.google.com/store/apps/details?id=com.unity3d.auicreativetestapp
     */
    set_google_play_url(url: string) {
        //@ts-ignore
        window.super_html && (super_html.google_play_url = url);
    }

    /**
     * 设置商店地址
     * channel : unity
     * @param url https://apps.apple.com/us/app/ad-testing/id1463016906
     */
    set_app_store_url(url: string) {
        //@ts-ignore
        window.super_html && (super_html.appstore_url = url);
    }
}

export default new super_html_playable();
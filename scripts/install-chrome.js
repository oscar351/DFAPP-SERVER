const { install } = require('@puppeteer/browsers');
install({
    browser: 'chrome',
    buildId: '137.0.7151.55', // 필요한 버전
    cacheDir: '/opt/render/.cache/puppeteer',
}).then(() => console.log('✅ Chrome installed'));
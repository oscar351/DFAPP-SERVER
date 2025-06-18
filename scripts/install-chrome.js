const { download } = require('@puppeteer/browsers');

(async () => {
    try {
        const revision = '137.0.7151.55'; // 현재 puppeteer에서 요구하는 Chrome 버전
        const platform = process.platform === 'linux' ? 'linux' : 'mac'; // Render는 linux
        const { executablePath } = await download({
            browser: 'chrome',
            platform,
            buildId: revision,
            cacheDir: '/opt/render/.cache/puppeteer',
        });
        console.log('✅ Chromium downloaded to', executablePath);
    } catch (err) {
        console.error('❌ Chromium download failed', err);
        process.exit(1);
    }
})();
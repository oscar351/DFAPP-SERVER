const { downloadBrowser } = require('@puppeteer/browsers');

(async () => {
    try {
        const revision = '137.0.7151.55';
        const platform = 'linux'; // Render 환경
        const { executablePath } = await downloadBrowser({
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
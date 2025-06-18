const puppeteer = require('puppeteer');

(async () => {
    try {
        const fetcher = puppeteer.createBrowserFetcher();
        const { executablePath } = await fetcher.download(puppeteer._preferredRevision);
        console.log('✅ Chromium downloaded to', executablePath);
    } catch (err) {
        console.error('❌ Chromium download failed', err);
        process.exit(1);
    }
})();
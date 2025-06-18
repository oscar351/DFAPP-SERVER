/******************************************************************
 * util/scraper.js  ▶ 공통 Playwright 유틸
 *****************************************************************/
const { chromium } = require('playwright');   // puppeteer 대신

// ❶ page 헬퍼: 작업 후 자동 close
async function withPage(fn) {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage({
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/117.0 Safari/537.36',
    });
    try {
        return await fn(page);
    } finally {
        await browser.close();
    }
}

// ❷ 숫자 파싱
const parseKor = txt => {
    if (!txt) return 0;
    const [, eok = '0'] = txt.match(/(\d+)\s*억/) || [];
    const [, man = '0'] = txt.match(/(\d+)\s*만/) || [];
    return +eok * 1e8 + +man * 1e4;
};
const parseComma = t => +(t || '0').replace(/,/g, '');

module.exports = { withPage, parseKor, parseComma };

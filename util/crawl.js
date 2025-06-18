const puppeteer = require('puppeteer');

function parseKoreanNumber(text) {
    if (!text) return 0;
    let total = 0;
    const eokMatch = text.match(/(\d+)\s*억/);
    const manMatch = text.match(/(\d+)\s*만/);

    if (eokMatch) total += parseInt(eokMatch[1]) * 100000000;
    if (manMatch) total += parseInt(manMatch[1]) * 10000;

    return total;
}

function parseCommaNumber(text) {
    if (!text) return 0;
    return parseInt(text.replace(/,/g, ''), 10);
}

async function fetchAdventureData(advenName) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://dundam.xyz/search?server=adven&name=${encodeURIComponent(advenName)}`;

    await page.goto(url, { waitUntil: 'networkidle2' });

    const results = await page.evaluate(() => {
        const rows = document.querySelectorAll('.scon');
        const data = [];

        rows.forEach(row => {
            const imgSrc = row.querySelector('img')?.getAttribute('src') || '';
            const matches = imgSrc.match(/characters\/([a-f0-9]{32})/);
            const characterId = matches ? matches[1] : '';

            const nameContainer = row.querySelector('.seh_name .name');
            const name = Array.from(nameContainer?.childNodes || [])
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .join('') || '';

            const level = row.querySelector('.seh_name .level .val')?.innerText.trim() || '';
            const set_point = row.querySelector('.seh_addinfo .sainf-tr .saninf-setp')?.innerText.trim() || '';
            const switcing = row.querySelector('.seh_addinfo .sainf-tr .saint-sumofswithing')?.innerText.trim() || '';
            const job = row.querySelector('.seh_job li')?.innerText.trim() || '';

            const rawDamage = row.querySelector('.stat_a .statc .val')?.innerText.trim() || '';
            const rawBuff = row.querySelector('.stat_b .statc .val')?.innerText.trim() || '';

            data.push({
                name,
                job,
                level,
                characterId,
                set_point,
                switcing,
                rawDamage,
                rawBuff
            });
        });

        return data;
    });

    const transformed = results.map(char => {
        const hasBuff = !!char.rawBuff;
        const damage = hasBuff ? 0 : parseKoreanNumber(char.rawDamage);
        const buff_power = hasBuff ? parseCommaNumber(char.rawBuff) : 0;

        return {
            ...char,
            damage,
            buff_power
        };
    });

    await browser.close();
    return transformed;
}


async function fetchCharacterData(server, keys) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const results = [];

    for (const key of keys) {
        const url = `https://dundam.xyz/character?server=${server}&key=${key}`;

        await page.goto(url, { waitUntil: 'networkidle2' });

        const html = await page.content();

        results.push({ key, html });  // 예시 결과 저장
    }

    await browser.close();
    return results;
}

async function fetchCharacterLuckyItem(advenName) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://dfgear.xyz/adventure?cName=${encodeURIComponent(advenName)}`;

    let dialogTriggered = false;

    page.on('dialog', async dialog => {
        dialogTriggered = true;
        console.log(`✅ 알림창 열림: "${dialog.message()}"`);
        await dialog.accept(); // 자동으로 '예' 클릭
    });
    await page.goto(url, { waitUntil: 'networkidle2' });

    // await page.waitForSelector('#advenRefresh', { visible: true });

    // const oldContent = await page.$eval('.card-body', el => el.textContent);

    // await page.click('#advenRefresh');

    // await page.waitForFunction(
    //     old => document.querySelector('.card-body')?.textContent !== old,
    //     { timeout: 60_000 },   // 10초 제한
    //     oldContent
    // );

    await page.waitForSelector('.card-body', { visible: true });

    const results = await page.evaluate(() => {
        const rows = document.querySelectorAll('.card-body');
        const data = [];

        rows.forEach(row => {
            const name = row.querySelector('.cName.uselct')?.innerText.trim() || '';
            const beRaw = row.querySelector('.uselct.be')?.innerText.trim() || '';
            const toRaw = row.querySelector('.uselct.to')?.innerText.trim() || '';
            const miRaw = row.querySelector('.uselct.mi')?.innerText.trim() || '';
            const mbRaw = row.querySelector('.uselct.mb-1')?.innerText.trim() || '';
            const r_epic = row.querySelector('.r_epic')?.innerText.trim() || '';
            const r_legnd = row.querySelector('.r_legnd')?.innerText.trim() || '';

            const extractNumber = str => {
                const match = str.match(/\d+/);
                return match ? match[0] : '0';
            };

            const be = extractNumber(beRaw);
            const to = extractNumber(toRaw);
            const mi = extractNumber(miRaw);
            const mb = extractNumber(mbRaw);

            data.push({
                name,
                be,
                to,
                mi,
                mb,
                r_epic,
                r_legnd
            });
        });

        return data;
    });

    await browser.close();
    return results;
}

async function fetchAdvenLuckyItem(advenName) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://dfgear.xyz/advtDetail?name=${encodeURIComponent(advenName)}`;

    await page.goto(url, { waitUntil: 'networkidle2' });

    const results = await page.evaluate(() => {
        const rows = document.querySelectorAll('.detailParent');
        const data = [];

        rows.forEach(row => {
            const totalB = row.querySelector('#totalB')?.innerText.trim() || '';
            const b_rate = row.querySelector('#b_rate')?.innerText.trim() || '';
            const epic = row.querySelector('#totalE')?.innerText.trim() || '';
            const legendary = row.querySelector('#totalL')?.innerText.trim() || '';
            const jar_epic = row.querySelector('#totalPe')?.innerText.trim() || '';
            const jar_legend = row.querySelector('#totalPl')?.innerText.trim() || '';
            const top_character = row.querySelector('#lucky #lk_name')?.innerText.trim() || '';
            const abyss_worshipper = row.querySelector('#totalAbyss')?.innerText.trim() || '';

            data.push({ totalB, b_rate, epic, legendary, jar_epic, jar_legend, top_character, abyss_worshipper });
        });

        return data;
    });
    await browser.close();
    return results;
}

exports.fetchAdventureData = fetchAdventureData;
exports.fetchCharacterData = fetchCharacterData;
exports.fetchCharacterLuckyItem = fetchCharacterLuckyItem;
exports.fetchAdvenLuckyItem = fetchAdvenLuckyItem;

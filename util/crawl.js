/******************************************************************
 * util/crawl.js  ▶ 실제 크롤러 함수 모음
 *****************************************************************/
const { withPage, parseKor, parseComma } = require('./scraper');

/* ─────────────────── 1. 모험단 검색 ─────────────────── */
exports.fetchAdventureData = async advenName =>
    withPage(async page => {
        await page.goto(
            `https://dundam.xyz/search?server=adven&name=${encodeURIComponent(advenName)}`,
            { waitUntil: 'domcontentloaded', timeout: 30_000 }
        );

        return await page.$$eval('.scon', rows => rows.map(r => {
            const img = r.querySelector('img')?.src ?? '';
            const id = (img.match(/characters\/([a-f0-9]{32})/) || [, ''])[1];
            const get = sel => r.querySelector(sel)?.textContent.trim() || '';

            const name = [...r.querySelector('.seh_name .name')?.childNodes ?? []]
                .filter(n => n.nodeType === Node.TEXT_NODE)
                .map(n => n.textContent.trim()).join('');

            return {
                characterId: id,
                name,
                level: get('.level .val'),
                set_point: get('.saninf-setp'),
                switching: get('.saint-sumofswithing'),
                job: get('.seh_job li'),
                rawDamage: get('.stat_a .statc .val'),
                rawBuff: get('.stat_b .statc .val'),
            };
        })).then(list =>
            list.map(c => ({
                ...c,
                damage: c.rawBuff ? 0 : parseKor(c.rawDamage),
                buff_power: c.rawBuff ? parseComma(c.rawBuff) : 0,
            }))
        );
    });

/* ─────────────────── 2. 캐릭터 상세 HTML ─────────────────── */
exports.fetchCharacterData = async (server, keys) =>
    withPage(async page => {
        const res = [];
        for (const key of keys) {
            await page.goto(
                `https://dundam.xyz/character?server=${server}&key=${key}`,
                { waitUntil: 'domcontentloaded', timeout: 30_000 }
            );
            res.push({ key, html: await page.content() });
        }
        return res;
    });

/* ─────────────────── 3. 캐릭터 운빨 ─────────────────── */
exports.fetchCharacterLuckyItem = async advenName =>
    withPage(async page => {
        await page.goto(
            `https://dfgear.xyz/adventure?cName=${encodeURIComponent(advenName)}`,
            { waitUntil: 'domcontentloaded', timeout: 30_000 }
        );
        await page.waitForSelector('.card-body');

        return await page.$$eval('.card-body', rows => rows.map(r => {
            const num = s => (s.match(/\d+/)?.[0] || '0');
            const get = sel => r.querySelector(sel)?.textContent.trim() || '';
            return {
                name: get('.cName.uselct'),
                be: num(get('.uselct.be')),
                to: num(get('.uselct.to')),
                mi: num(get('.uselct.mi')),
                mb: num(get('.uselct.mb-1')),
                r_epic: get('.r_epic'),
                r_legnd: get('.r_legnd'),
            };
        }));
    });

/* ─────────────────── 4. 모험단 운빨 요약 ─────────────────── */
exports.fetchAdvenLuckyItem = async advenName =>
    withPage(async page => {
        await page.goto(
            `https://dfgear.xyz/advtDetail?name=${encodeURIComponent(advenName)}`,
            { waitUntil: 'domcontentloaded', timeout: 30_000 }
        );

        return await page.$$eval('.detailParent', rows => rows.map(r => ({
            totalB: r.querySelector('#totalB')?.textContent.trim() || '',
            b_rate: r.querySelector('#b_rate')?.textContent.trim() || '',
            epic: r.querySelector('#totalE')?.textContent.trim() || '',
            legendary: r.querySelector('#totalL')?.textContent.trim() || '',
            jar_epic: r.querySelector('#totalPe')?.textContent.trim() || '',
            jar_legend: r.querySelector('#totalPl')?.textContent.trim() || '',
            top_character: r.querySelector('#lucky #lk_name')?.textContent.trim() || '',
            abyss_worshipper: r.querySelector('#totalAbyss')?.textContent.trim() || '',
        })));
    });

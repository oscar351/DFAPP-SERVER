const express = require('express');
const { fetchAdventureData, fetchCharacterData, fetchCharacterLuckyItem, fetchAdvenLuckyItem } = require('../../util/crawl');
const prisma = require('../../client');

const crawlAdventure = async (req, res, next) => {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'name parameter is required' });

    try {
        const results = await fetchAdventureData(name);
        res.json(results);
    } catch (err) {
        console.error('Error in /crawl:', err);
        res.status(500).json({ error: 'Crawling failed' });
    }
}

const crawlAdventureItem = async (req, res) => {
    const { name: userName, adven } = req.query;

    if (!userName) return res.status(400).json({ error: 'name parameter is required' });

    try {
        const results = await fetchCharacterLuckyItem(adven);

        // 현재 존재하는 캐릭터 목록 불러오기
        const existingCharacters = await prisma.userCharacter.findMany({
            where: { user_name: userName },
            select: { character_name: true },
        });
        const existingNames = new Set(existingCharacters.map(c => c.character_name));

        const updated = [];

        for (const ch of results) {
            if (!existingNames.has(ch.name)) continue; // 존재하지 않으면 건너뜀

            const result = await prisma.characterItems.upsert({
                where: {
                    user_name_character_name: {
                        user_name: userName,
                        character_name: ch.name,
                    },
                },
                update: {
                    taecho: Number(ch.be ?? 0),
                    epic: Number(ch.to ?? 0),
                    legendary: Number(ch.mi ?? 0),
                    abyss_worshipper: Number(ch.mb ?? 0),
                    jar_epic: Number(ch.r_epic ?? 0),
                    jar_legend: Number(ch.r_legnd ?? 0),
                },
                create: {
                    // 이 create는 이론적으로 도달하지 않음 (FK 때문에 막힘)
                    user_name: userName,
                    character_name: ch.name,
                    taecho: Number(ch.be ?? 0),
                    epic: Number(ch.to ?? 0),
                    legendary: Number(ch.mi ?? 0),
                    abyss_worshipper: Number(ch.mb ?? 0),
                    jar_epic: Number(ch.r_epic ?? 0),
                    jar_legend: Number(ch.r_legnd ?? 0),
                    detail_link: null,
                },
            });

            updated.push(result);
        }

        res.json({ updated });
    } catch (err) {
        console.error('Error in /crawl:', err);
        res.status(500).json({ error: 'Crawling failed' });
    }
};

const crawlTotalItem = async (req, res) => {
    const { name: userName } = req.query;

    if (!userName) {
        return res.status(400).json({ error: 'name and adven parameters are required' });
    }

    const adventure = await prisma.adventureTeam.findFirst({
        where: {
            user_name: userName,
        },
        select: {
            adventure_name: true,
        },
    });

    if (!adventure) {
        return res.status(404).json({ error: 'AdventureTeam not found for this user' });
    }

    const adventureName = adventure.adventure_name;
    const updated = [];

    try {
        const results = await fetchCharacterLuckyItem(adventureName);

        // 현재 존재하는 캐릭터 목록 불러오기
        const existingCharacters = await prisma.userCharacter.findMany({
            where: { user_name: userName },
            select: { character_name: true },
        });
        const existingNames = new Set(existingCharacters.map(c => c.character_name));


        for (const ch of results) {
            if (!existingNames.has(ch.name)) continue; // 존재하지 않으면 건너뜀

            const result = await prisma.characterItems.upsert({
                where: {
                    user_name_character_name: {
                        user_name: userName,
                        character_name: ch.name,
                    },
                },
                update: {
                    taecho: Number(ch.be ?? 0),
                    epic: Number(ch.to ?? 0),
                    legendary: Number(ch.mi ?? 0),
                    abyss_worshipper: Number(ch.mb ?? 0),
                    jar_epic: Number(ch.r_epic ?? 0),
                    jar_legend: Number(ch.r_legnd ?? 0),
                },
                create: {
                    // 이 create는 이론적으로 도달하지 않음 (FK 때문에 막힘)
                    user_name: userName,
                    character_name: ch.name,
                    taecho: Number(ch.be ?? 0),
                    epic: Number(ch.to ?? 0),
                    legendary: Number(ch.mi ?? 0),
                    abyss_worshipper: Number(ch.mb ?? 0),
                    jar_epic: Number(ch.r_epic ?? 0),
                    jar_legend: Number(ch.r_legnd ?? 0),
                    detail_link: null,
                },
            });

            updated.push(result);
        }

    } catch (err) {
        console.error('Error in /crawl:', err);
        res.status(500).json({ error: 'Crawling failed' });
    }

    try {
        const results = await fetchAdvenLuckyItem(adventureName);

        for (const ch of results) {
            const result = await prisma.advenItems.upsert({
                where: {
                    adventure_name: adventureName, // @id
                },
                update: {
                    taecho: Number(ch.totalB ?? 0),
                    taecho_ratio: ch.b_rate ?? "0%",
                    epic: Number(ch.epic ?? 0),
                    legendary: Number(ch.legendary ?? 0),
                    jar_epic: Number(ch.jar_epic ?? 0),
                    jar_legend: Number(ch.jar_legend ?? 0),
                    top_character: ch.top_character ?? null,
                    abyss_worshipper: Number(ch.abyss_worshipper ?? 0),
                },
                create: {
                    adventure_name: adventureName,
                    user_name: userName,
                    taecho: Number(ch.totalB ?? 0),
                    taecho_ratio: ch.b_rate ?? "0%",
                    epic: Number(ch.epic ?? 0),
                    legendary: Number(ch.legendary ?? 0),
                    jar_epic: Number(ch.jar_epic ?? 0),
                    jar_legend: Number(ch.jar_legend ?? 0),
                    top_character: ch.top_character ?? null,
                    abyss_worshipper: Number(ch.abyss_worshipper ?? 0),
                }
            });

            updated.push(result);
        }

        res.json({ updated });
    } catch (err) {
        console.error('Error in /crawl:', err);
        res.status(500).json({ error: 'Crawling failed' });
    }
};

const crawlCharacter = async (req, res, next) => {
    const { name: user_name } = req.query;
    if (!user_name) return res.status(400).json({ error: 'name parameter is required' });

    try {
        // 1. AdventureTeam 조회
        const adventureTeam = await prisma.AdventureTeam.findFirst({
            where: { user_name },
            select: { server: true, adventure_name: true }
        });

        if (!adventureTeam) return res.status(404).json({ error: 'AdventureTeam not found' });
        const { server, adventure_name } = adventureTeam;

        // 2. detail_link 목록 수집
        const detailLinks = (
            await prisma.UserCharacter.findMany({
                where: { user_name },
                select: { detail_link: true },
            })
        )
            .map(({ detail_link }) => detail_link)
            .filter(Boolean);

        if (detailLinks.length === 0) return res.status(404).json({ error: 'No detail_link found for characters' });

        // 3. 크롤링
        const resultsChar = await fetchCharacterData(server, detailLinks);
        const resultsAdven = await fetchAdventureData(adventure_name);

        // 4. 데이터 upsert + 연관 테이블 보장
        for (const char of resultsAdven) {
            const character_name = char.name;

            await prisma.UserCharacter.upsert({
                where: { user_name_character_name: { user_name, character_name } },
                update: {
                    detail_link: char.characterId,
                    character_name,
                    job: char.job,
                    fame: parseInt(char.level || "0", 10),
                    set_point: parseInt(char.set_point || "0", 10),
                    switching: char.switching,
                    damage: char.damage,
                    buff_power: char.buff_power,
                    adventureTeam: {
                        connect: {
                            adventure_name_user_name: { adventure_name, user_name },
                        },
                    },
                },
                create: {
                    character_name,
                    detail_link: char.characterId,
                    job: char.job,
                    fame: parseInt(char.level || "0", 10),
                    set_point: parseInt(char.set_point || "0", 10),
                    switching: char.switching,
                    damage: char.damage,
                    buff_power: char.buff_power,
                    adventureTeam: {
                        connect: {
                            adventure_name_user_name: { adventure_name, user_name },
                        },
                    },
                },
            });

            // 5. Homework 생성 (없을 때만)
            await prisma.homework.upsert({
                where: {
                    user_name_character_name: { user_name, character_name },
                },
                update: {}, // 아무것도 업데이트하지 않음
                create: {
                    user_name,
                    character_name,
                    // 모든 컬럼은 default(false)
                },
            });

            // 6. CharacterItems 생성 (없을 때만)
            await prisma.characterItems.upsert({
                where: {
                    user_name_character_name: { user_name, character_name },
                },
                update: {}, // 아무것도 업데이트하지 않음
                create: {
                    user_name,
                    character_name,
                    taecho: 0,
                    epic: 0,
                    legendary: 0,
                    abyss_worshipper: 0,
                    jar_epic: 0,
                    jar_legend: 0,
                    detail_link: null,
                },
            });
        }

        res.json(resultsAdven);
    } catch (err) {
        console.error('Error in /crawl:', err);
        res.status(500).json({ error: 'Crawling failed' });
    }
};

module.exports = {
    crawlAdventure,
    crawlCharacter,
    crawlAdventureItem,
    crawlTotalItem
};
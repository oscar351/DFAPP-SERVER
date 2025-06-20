const prisma = require('../../client');
const { fetchAdventureData, fetchCharacterLuckyItem, fetchAdvenLuckyItem } = require('../../util/crawl');
const { makeRecommend } = require('../../util/recommend')
const transformBigInt = (obj) => {
    return JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v));
};

const getCharacters = async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: 'Missing required query parameter: name' });
    }

    try {

        const [characters, buffSets] = await Promise.all([
            prisma.userCharacter.findMany({
                where: { user_name: name },
                orderBy: [{ damage: 'desc' }, { buff_power: 'desc' }],
                include: {
                    recommendDungeon: true,
                    character_items: true,
                    adventureTeam: true,
                    homework: true,
                },
            }),
            prisma.buffExchangeSet.findMany({
                where: { user_name: name },
            }),
        ]);

        const safeData = transformBigInt(characters);
        res.json({
            characters: transformBigInt(characters),
            buffSets,                             // 그대로 내려줌
        });
    } catch (error) {
        console.error(`[ERROR][GET /characters] Failed to fetch characters for user "${name}":`, err);
        return res.status(500).json({ error: 'Failed to retrieve character data. Please try again later.' });
    }
};

const getCharactersItem = async (req, res) => {
    try {
        const { name } = req.query;

        // 1. 캐릭터별 아이템
        const characterItems = await prisma.characterItems.findMany({
            where: {
                user_name: name,
                userCharacter: {
                    visible: true,
                },
            },
            orderBy: [
                { taecho: 'desc' },
                { epic: 'desc' },
            ],
        });

        // 2. 모험단 요약 아이템
        const advenItems = await prisma.advenItems.findMany({
            where: { user_name: name }, // user_name 기준으로 가져오기
            orderBy: [{ taecho: 'desc' }],
        });

        res.json({ characterItems, advenItems });
    } catch (error) {
        console.error('Error fetching characters:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAdventureTeams = async (req, res) => {
    try {
        const entries = await prisma.AdventureTeam.findMany({
            select: {
                user_name: true,
                adventure_name: true,
            },
            distinct: ['adventure_name'], // 중복 방지 (필요시)
        });

        res.json(entries);
    } catch (error) {
        console.error('Error fetching adventure:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const addAdventureTeam = async (req, res) => {
    try {
        const { user_name, adventure_name, server } = req.body;

        if (!user_name || !adventure_name || !server) {
            return res.status(400).json({ error: 'user_name, adventure_name, and server are required' });
        }

        const existingTeam = await prisma.AdventureTeam.findUnique({
            where: {
                adventure_name_user_name: {
                    adventure_name,
                    user_name,
                },
            },
        });

        if (existingTeam) {
            return res.status(409).json({ error: 'Adventure team already exists' });
        }


        const characters = await fetchAdventureData(adventure_name);
        console.log(`[크롤링 완료] ${characters.length}개의 캐릭터`);

        if (!characters.length) {
            console.warn(`[크롤링 실패] "${adventure_name}" 모험단에서 캐릭터를 찾을 수 없습니다.`);
            return res.status(400).json({
                error: `모험단 "${adventure_name}"에 해당하는 캐릭터 정보를 찾을 수 없습니다.`,
            });
        }

        const newTeam = await prisma.AdventureTeam.create({
            data: {
                user_name,
                adventure_name,
                server,
            },
        });

        for (const char of characters) {

            const rec = makeRecommend({
                fame: Number(char.level ?? 0),
                damage: Number(char.damage ?? 0),
                buff: Number(char.buff_power ?? 0),
            });

            await prisma.UserCharacter.upsert({
                where: {
                    user_name_character_name: {
                        user_name: user_name,
                        character_name: char.name,
                    },
                },
                update: {
                    detail_link: char.characterId,
                    character_name: char.name,
                    job: char.job,
                    fame: parseInt(char.level || 0),
                    set_point: parseInt(char.set_point || 0),
                    switching: char.switching,
                    damage: char.damage,
                    buff_power: char.buff_power,
                    adventureTeam: {
                        connect: {
                            adventure_name_user_name: {
                                adventure_name,
                                user_name,
                            },
                        },
                    },
                },
                create: {
                    detail_link: char.characterId,
                    character_name: char.name,
                    job: char.job,
                    fame: parseInt(char.level || 0),
                    set_point: parseInt(char.set_point || 0),
                    switching: char.switching,
                    damage: char.damage,
                    buff_power: char.buff_power,
                    adventureTeam: {
                        connect: {
                            adventure_name_user_name: {
                                adventure_name,
                                user_name,
                            },
                        },
                    },
                },
            });

            await prisma.recommendDungeon.upsert({
                where: {
                    user_name_character_name: {
                        user_name,
                        character_name: char.name,
                    },
                },
                update: rec,
                create: {
                    user_name,
                    character_name: char.name,
                    ...rec,
                },
            });

            await prisma.Homework.create({
                data: {
                    user_name,
                    character_name: char.name,
                    // 나머지는 모두 default(false) 처리됨
                },
            });

            // 5. CharacterItems 자동 생성
            await prisma.CharacterItems.create({
                data: {
                    user_name,
                    character_name: char.name,
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

        const characterLuckyItem = await fetchCharacterLuckyItem(adventure_name);

        const existingCharacters = await prisma.userCharacter.findMany({
            where: { user_name: user_name },
            select: { character_name: true },
        });

        const existingNames = new Set(existingCharacters.map(c => c.character_name));


        for (const ch of characterLuckyItem) {
            if (!existingNames.has(ch.name)) continue; // 존재하지 않으면 건너뜀

            const result = await prisma.characterItems.upsert({
                where: {
                    user_name_character_name: {
                        user_name: user_name,
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
                    user_name: user_name,
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
        }

        const AdvenLuckyItem = await fetchAdvenLuckyItem(adventure_name);

        for (const ch of AdvenLuckyItem) {
            const result = await prisma.advenItems.upsert({
                where: {
                    adventure_name: adventure_name, // @id
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
                    adventure_name: adventure_name,
                    user_name: user_name,
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
        }
        res.status(201).json(newTeam);
    } catch (error) {
        console.error('Error adding adventure team and characters:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const patchHomework = async (req, res) => {
    const { studentName, character_name, field, value } = req.body;

    if (!studentName || !character_name || !field || value === undefined) {
        return res.status(400).json({ error: "필수 항목 누락" });
    }

    const homeworkFieldMap = {
        "나벨(일반)": "nabel_normal",
        "나벨(매칭)": "nabel_match",
        "안개신": "mist",
        "강림": "advent",
        "2단": "stage2",
        "1단": "stage1",
        "여신전": "goddess",
        "애쥬어 메인": "azure",
        "흉몽": "nightmare",
        "달잠호": "moonlake",
        "솔리다": "solidaris",
        "흰구름": "whitevalley"
    };

    const dbField = homeworkFieldMap[field];

    if (!dbField) {
        return res.status(400).json({ error: "알 수 없는 과제명입니다." });
    }

    try {
        await prisma.homework.update({
            where: {
                user_name_character_name: {
                    user_name: studentName,
                    character_name,
                },
            },
            data: {
                [dbField]: value,
            },
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("DB 업데이트 실패:", err);
        res.status(500).json({ error: "업데이트 실패" });
    }
}

const summary = async (req, res) => {
    const teams = await prisma.adventureTeam.findMany({
        select: { user_name: true, adventure_name: true },
    });

    const payload = await Promise.all(
        teams.map(async ({ user_name }) => {
            const chars = await prisma.userCharacter.findMany({
                where: {
                    user_name,
                    visible: true,
                },
                select: {
                    character_name: true,
                    buff_power: true,           // ➜ 0 이면 딜러
                    recommendDungeon: true,     // [{ …  nabel_normal:true … }]
                    homework: true,             // { nabel_normal:true … }
                },
            });
            return { user_name, chars };
        })
    );

    res.json(safeJson(payload));
}

const damageRank = async (req, res) => {
    try {
        const topDamage = await prisma.userCharacter.findMany({
            where: { damage: { not: null } },
            orderBy: { damage: 'desc' },
            take: 20,
            select: {
                user_name: true,
                character_name: true,
                job: true,
                damage: true,
                adventure_name: true
            }
        });

        const data = topDamage.map(u => ({
            ...u,
            damage: u.damage?.toString() ?? '0'
        }));

        res.json(data);
    } catch (err) {
        console.error('damageRank error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const BuffRank = async (req, res) => {
    try {
        const topBuff = await prisma.userCharacter.findMany({
            where: { buff_power: { not: null } },
            orderBy: { buff_power: 'desc' },
            take: 20,
            select: {
                user_name: true,
                character_name: true,
                job: true,
                buff_power: true,
                adventure_name: true
            }
        });

        const data = topBuff.map(u => ({
            ...u,
            buff_power: u.buff_power?.toString() ?? '0'
        }));

        res.json(data);
    } catch (err) {
        console.error('damageRank error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const luckyRank = async (req, res) => {
    try {

        const items = await prisma.characterItems.findMany({
            select: {
                user_name: true,
                character_name: true,
                taecho: true,
                epic: true,
                legendary: true,
                jar_epic: true,
                jar_legend: true
            }
        });

        const topLucky = items
            .map(i => ({
                ...i,
                score:
                    ((i.taecho ?? 0) * 10) +
                    ((i.epic ?? 0) * 2.5) +
                    (i.legendary ?? 0)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);

        res.json(topLucky);
    } catch (err) {
        console.error('luckyRank error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const luckyAdvenRank = async (req, res) => {
    try {
        const advenItems = await prisma.advenItems.findMany({
            select: {
                adventure_name: true,
                user_name: true,
                taecho: true,
                epic: true,
                legendary: true,
                jar_epic: true,
                jar_legend: true,
                top_character: true,
                abyss_worshipper: true
            }
        });

        const scored = advenItems.map(item => {
            const taecho = item.taecho ?? 0;
            const epic = item.epic ?? 0;
            const legendary = item.legendary ?? 0;

            const score = taecho * 10 + epic * 2.5 + legendary;

            return {
                adventure_name: item.adventure_name,
                user_name: item.user_name,
                score,
                taecho,
                epic,
                legendary,
                top_character: item.top_character,
                abyss_worshipper: item.abyss_worshipper
            };
        });

        const topRanked = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 20); // 필요시 파라미터로 TOP 개수 조절

        res.json(topRanked);
    } catch (err) {
        console.error("luckyAdvenRank error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const safeJson = (data) =>
    JSON.parse(
        JSON.stringify(data, (_k, v) =>
            typeof v === "bigint" ? Number(v) /* 또는 v.toString() */ : v
        )
    );

const patchCharacterVisibility = async (req, res) => {
    const { user_name, updates } = req.body;
    if (!user_name || !Array.isArray(updates)) {
        return res.status(400).json({ error: 'invalid payload' });
    }

    try {
        await Promise.all(
            updates.map(({ character_name, visible }) =>
                prisma.userCharacter.update({
                    where: {
                        user_name_character_name: {
                            user_name,
                            character_name,
                        },
                    },
                    data: { visible },
                })
            )
        );
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'update fail' });
    }
};

module.exports = {
    getCharacters,
    addAdventureTeam,
    getAdventureTeams,
    patchHomework,
    summary,
    getCharactersItem,
    damageRank,
    BuffRank,
    luckyRank,
    luckyAdvenRank,
    patchCharacterVisibility
};
const cron = require('node-cron');
const { fetchAdventureData } = require('../util/crawl');
const prisma = require('../client');

cron.schedule('0 10 * * *', async () => {
    console.log('[크론] 오전 10시 자동 크롤링 시작');

    const entries = await prisma.AdventureTeam.findMany({
        select: {
            user_name: true,
            adventure_name: true,
        },
        distinct: ['adventure_name'], // 중복 방지 (필요시)
    });

    for (const { user_name, adventure_name } of entries) {
        try {
            const characters = await fetchAdventureData(adventure_name);
            console.log(`[${user_name} / ${adventure_name}] 크롤링 성공:`, characters.length, '개');

            for (const char of characters) {
                console.log(char);
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
            }
        } catch (err) {
            console.error(`[${user_name} / ${adventure_name}] 크롤링 실패:`, err.message);
        }
    }
});

cron.schedule(
    '0 9 * * 4',                 // “분 시 일 월 요일” ⇒ 4 = Thursday
    async () => {
        console.log('[크론] 목요일 09:00 숙제 초기화 시작');

        try {
            const reset = await prisma.homework.updateMany({
                data: {
                    nabel_normal: false,
                    nabel_match: false,
                    mist: false,
                    advent: false,
                    stage2: false,
                    stage1: false,
                    goddess: false,
                    azure: false,
                    nightmare: false,
                    moonlake: false,
                    solidaris: false,
                    whitevalley: false,
                },
            });

            console.log(`[크론] 숙제 초기화 완료 – ${reset.count} 행이 리셋되었습니다.`);
        } catch (err) {
            console.error('[크론] 숙제 초기화 실패:', err.message);
        }
    },
    {
        timezone: 'Asia/Seoul',    // 서버-TZ와 무관하게 한국 시간 09:00에 실행
    }
);
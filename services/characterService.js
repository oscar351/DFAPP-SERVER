// import prisma from '../client';
// import { fetchAdventureData, fetchCharacterLuckyItem, fetchAdvenLuckyItem } from '../util/crawl';
// import { makeRecommend } from '../util/recommend';

// /* ────────────── 캐릭터 CRUD ────────────── */

// export const listCharacters = (user: string) =>
//     prisma.userCharacter.findMany({
//         where: { user_name: user },
//         orderBy: [{ damage: 'desc' }, { buff_power: 'desc' }],
//         include: {
//             recommendDungeon: true,
//             character_items: true,
//             adventureTeam: true,
//             homework: true,
//         },
//     });

// export const listCharacterItems = (user: string) =>
//     prisma.characterItems.findMany({
//         where: {
//             user_name: user,
//             userCharacter: { visible: true },
//         },
//         orderBy: [{ taecho: 'desc' }, { epic: 'desc' }],
//     });

// export const listAdvenItems = (user: string) =>
//     prisma.advenItems.findMany({
//         where: { user_name: user },
//         orderBy: [{ taecho: 'desc' }],
//     });

// /* ────────────── Adventure Team 크롤 & 저장 ────────────── */

// export async function createAdventureTeam(payload: {
//     user_name: string;
//     adventure_name: string;
//     server: string;
// }) {
//     const { user_name, adventure_name, server } = payload;

//     // 1. 이미 존재?
//     const exists = await prisma.adventureTeam.findUnique({
//         where: { adventure_name_user_name: { adventure_name, user_name } },
//     });
//     if (exists) throw new Error('ALREADY_EXISTS');

//     // 2. 크롤링
//     const crawled = await fetchAdventureData(adventure_name);
//     if (!crawled.length) throw new Error('TEAM_NOT_FOUND');

//     // 3. AdventureTeam 생성
//     await prisma.adventureTeam.create({ data: { user_name, adventure_name, server } });

//     // 4. 캐릭터 + 부가 테이블 upsert
//     for (const ch of crawled) {
//         const recommend = makeRecommend({
//             fame: Number(ch.level ?? 0),
//             damage: Number(ch.damage ?? 0),
//             buff: Number(ch.buff_power ?? 0),
//         });

//         await prisma.userCharacter.upsert({
//             where: { user_name_character_name: { user_name, character_name: ch.name } },
//             create: {
//                 ...mapCharFields(ch),
//                 adventureTeam: { connect: { adventure_name_user_name: { adventure_name, user_name } } },
//             },
//             update: mapCharFields(ch),
//         });

//         await prisma.recommendDungeon.upsert({
//             where: { user_name_character_name: { user_name, character_name: ch.name } },
//             create: { user_name, character_name: ch.name, ...recommend },
//             update: recommend,
//         });

//         await prisma.homework.upsert({
//             where: { user_name_character_name: { user_name, character_name: ch.name } },
//             create: { user_name, character_name: ch.name },
//             update: {}, // 아무것도 갱신 안 함
//         });

//         await prisma.characterItems.upsert({
//             where: { user_name_character_name: { user_name, character_name: ch.name } },
//             create: { user_name, character_name: ch.name },
//             update: {},
//         });
//     }

//     // 5. 운빨 아이템 업데이트
//     await updateLuckyItems(user_name, adventure_name);

//     return { success: true };
// }

// /* ----------------- 헬퍼 ----------------- */

// function mapCharFields(ch: any) {
//     return {
//         detail_link: ch.characterId,
//         character_name: ch.name,
//         job: ch.job,
//         fame: Number(ch.level ?? 0),
//         set_point: Number(ch.set_point ?? 0),
//         switching: ch.switching,
//         damage: ch.damage,
//         buff_power: ch.buff_power,
//     };
// }

// async function updateLuckyItems(user: string, adv: string) {
//     const charLucky = await fetchCharacterLuckyItem(adv);
//     const advLucky = await fetchAdvenLuckyItem(adv);

//     /* 캐릭터별 */
//     for (const c of charLucky) {
//         await prisma.characterItems.update({
//             where: { user_name_character_name: { user_name: user, character_name: c.name } },
//             data: {
//                 taecho: +c.be, epic: +c.to, legendary: +c.mi,
//                 abyss_worshipper: +c.mb,
//                 jar_epic: +c.r_epic, jar_legend: +c.r_legnd,
//             },
//         });
//     }

//     /* 모험단 요약 */
//     const a = advLucky[0];
//     if (!a) return;

//     await prisma.advenItems.upsert({
//         where: { adventure_name: adv },
//         create: {
//             adventure_name: adv,
//             user_name: user,
//             taecho: +a.totalB,
//             taecho_ratio: a.b_rate,
//             epic: +a.epic,
//             legendary: +a.legendary,
//             jar_epic: +a.jar_epic,
//             jar_legend: +a.jar_legend,
//             top_character: a.top_character,
//             abyss_worshipper: +a.abyss_worshipper,
//         },
//         update: {
//             taecho: +a.totalB,
//             taecho_ratio: a.b_rate,
//             epic: +a.epic,
//             legendary: +a.legendary,
//             jar_epic: +a.jar_epic,
//             jar_legend: +a.jar_legend,
//             top_character: a.top_character,
//             abyss_worshipper: +a.abyss_worshipper,
//         },
//     });
// }

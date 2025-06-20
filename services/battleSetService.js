const prisma = require('../client');

/** 공통 유효성 검사 */
function validatePayload(p) {
    if (!p.user_name || !p.adventure_name) {
        const err = new Error('user_name & adventure_name required');
        err.code = 400;
        throw err;
    }
    if (!p.set_name) {
        const err = new Error('set_name required');
        err.code = 400;
        throw err;
    }
    if (!p.buff_character || !p.dealers || p.dealers.length !== 3) {
        const err = new Error('buffer + 3 dealers required');
        err.code = 400;
        throw err;
    }
}

/** 프론트 → Prisma 필드 매핑 */
function mapToPrisma(p) {
    return {
        adventure_name: p.adventure_name,
        user_name: p.user_name,
        set_name: p.set_name,
        buff_character: p.buff_character,
        dealer_character1: p.dealers[0] || null,
        dealer_character2: p.dealers[1] || null,
        dealer_character3: p.dealers[2] || null,
        color: p.color === "custom" ? (p.customColor || 'purple') : p.color,
    };
}

/** Prisma → 프론트 인터페이스 변환 */
function mapToFront(r) {
    return {
        id: r.id,
        name: r.set_name,
        color: r.color,
        buffer: { name: r.buff_character },          // 최소 필드만 반환, 필요 시 확장
        dealers: [
            r.dealer_character1 ? { name: r.dealer_character1 } : null,
            r.dealer_character2 ? { name: r.dealer_character2 } : null,
            r.dealer_character3 ? { name: r.dealer_character3 } : null,
        ],
    };
}

/* ────────────────────────── 신규 생성 ────────────────────────── */
async function createBattleSet(body) {
    validatePayload(body);

    const created = await prisma.buffExchangeSet.create({
        data: mapToPrisma(body),
    });

    return mapToFront(created);
}

/* ────────────────────────── 수정 ────────────────────────────── */
async function updateBattleSet(id, body) {
    validatePayload(body);

    const updated = await prisma.buffExchangeSet.update({
        where: { id },
        data: mapToPrisma(body),
    });

    return mapToFront(updated);
}

async function deleteBattleSet(id) {
    await prisma.buffExchangeSet.delete({
        where: { id: id },
    });
    return { success: true };
}

module.exports = {
    createBattleSet,
    updateBattleSet,
    deleteBattleSet
};

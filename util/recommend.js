function makeRecommend({ fame, damage, buff }) {
    return {
        nabel_normal: damage >= 3000000000 || buff >= 4000000,
        nabel_match: (fame >= 47684 && damage > 0 && damage < 3000000000) || (fame >= 47684 && buff > 0 && buff < 4000000),
        mist: (fame >= 40000 && (damage > 0 || buff > 0)),
        advent: damage >= 1700000000 || buff >= 3500000,
        stage2: (damage < 1700000000 && damage >= 900000000) || (buff < 3500000 && buff >= 2700000),
        stage1: (damage < 900000000 && damage > 0 && fame >= 41929) || (buff < 2700000 && buff > 0 && fame >= 41929),
        goddess: (fame >= 48988 && (damage > 0 || buff > 0)),
        azure: (fame >= 44929 && (damage > 0 || buff > 0)),
        nightmare: false, // 필요 시 조건 추가
        moonlake: (fame >= 34749 && fame < 48988 && (damage > 0 || buff > 0)),
        solidaris: (fame >= 23016 && fame < 44929 && (damage > 0 || buff > 0)),
        whitevalley: (fame >= 16316 && fame < 34749 && (damage > 0 || buff > 0)),
    };
}

module.exports = { makeRecommend };
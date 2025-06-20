const prisma = require('../../client');
const { createBattleSet, updateBattleSet, deleteBattleSet } = require('../../services/battleSetService');


const addBattleSets = async (req, res) => {
    try {
        const created = await createBattleSet(req.body);
        return res.status(201).json(created);
    } catch (e) {
        console.error('[POST /battle-sets]', e);
        return res.status(e.code || 500).json({ error: e.message || 'internal' });
    }
}

const putBattleSets = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });

        const updated = await updateBattleSet(id, req.body);
        return res.json(updated);
    } catch (e) {
        console.error('[PUT /battle-sets]', e);
        return res.status(e.code || 500).json({ error: e.message || 'internal' });
    }
}

const deleteBattleSets = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });

        const deleted = await deleteBattleSet(id);
        return res.json(deleted);
    } catch (e) {
        console.error('[DELETE /battle-sets]', e);
        return res.status(e.code || 500).json({ error: e.message || 'internal' });
    }
}

module.exports = {
    addBattleSets,
    putBattleSets,
    deleteBattleSets
};
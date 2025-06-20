const express = require('express');
const router = express.Router();
const { getCharacters, addAdventureTeam, getAdventureTeams, patchHomework, summary, getCharactersItem, luckyRank, damageRank, luckyAdvenRank, patchCharacterVisibility, BuffRank } = require('./characters');
const { addBattleSets, putBattleSets, deleteBattleSets } = require('./battleSet');
router.get('/characters', getCharacters);
router.get('/adven', getAdventureTeams);
router.post('/adven', addAdventureTeam);
router.patch('/characters', patchHomework);
router.get('/summary', summary)
router.get('/items', getCharactersItem)
router.get('/damageRank', damageRank)
router.get('/buffRank', BuffRank)
router.get('/luckyRank', luckyRank)
router.get('/luckyAdvenRank', luckyAdvenRank)
router.patch('/characters/visibility', patchCharacterVisibility);
router.post('/battle-sets', addBattleSets);
router.put('/battle-sets/:id', putBattleSets);
router.delete('/battle-sets/:id', deleteBattleSets);
module.exports = router;
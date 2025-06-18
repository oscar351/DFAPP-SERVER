const express = require('express');
const router = express.Router();
const { getCharacters, addAdventureTeam, getAdventureTeams, patchHomework, summary, getCharactersItem, luckyRank, damageRank, luckyAdvenRank, patchCharacterVisibility } = require('./characters');

router.get('/characters', getCharacters);
router.get('/adven', getAdventureTeams);
router.post('/adven', addAdventureTeam);
router.patch('/characters', patchHomework);
router.get('/summary', summary)
router.get('/items', getCharactersItem)
router.get('/damageRank', damageRank)
router.get('/luckyRank', luckyRank)
router.get('/luckyAdvenRank', luckyAdvenRank)
router.patch('/characters/visibility', patchCharacterVisibility);
module.exports = router;
const express = require('express');
const router = express.Router();
const { crawlAdventure, crawlCharacter, crawlAdventureItem, crawlTotalItem } = require('./crawler');

router.get('/adven', crawlAdventure);
router.get('/chracter', crawlCharacter);
router.get('/item', crawlAdventureItem);
router.get('/advenItem', crawlTotalItem)

module.exports = router;
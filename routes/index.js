var express = require('express');
const crawlerRouter = require('./crawler');
const charactersRouter = require('./characters');

var router = express.Router();


router.use('/api', charactersRouter);
router.use('/crawl', crawlerRouter);


module.exports = router;

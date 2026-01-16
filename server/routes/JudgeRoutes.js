const express = require('express');
const router = express.Router();
const { evaluateCode } = require('../controllers/JudgeController');

router.post('/', evaluateCode);

module.exports = router;
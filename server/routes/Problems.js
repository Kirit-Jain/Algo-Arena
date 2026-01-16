const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');

router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find().select('title slug difficulty');
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const problem = await Problem.findOne({ slug: req.params.slug });
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
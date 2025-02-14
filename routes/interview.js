const express = require('express');
const router = express.Router();
const questions = require('../models/questions');

router.post('/start', (req, res) => {
    const { domain } = req.body;
    if (!questions[domain]) {
        return res.status(400).json({ message: "Invalid domain selected." });
    }

    const selectedQuestions = questions[domain];
    res.json({ questions: selectedQuestions });
});

router.post('/submit', (req, res) => {
    const { answers } = req.body;

    let score = 0;
    answers.forEach(answer => {
        const correctAnswer = questions[answer.domain].find(q => q.question === answer.question).answer;
        if (answer.answer === correctAnswer) {
            score++;
        }
    });

    res.json({ score });
});

module.exports = router;

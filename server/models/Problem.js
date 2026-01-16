const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    startercode: {
        type: String,
        required: true
    },
    testcases: [{
        input: String,
        output: String
    }]
});

module.exports = mongoose.model('Problem', ProblemSchema);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('./models/Problem');
const connectDB = require('./database');

dotenv.config();
connectDB();

const problems = [
    {
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
        startercode: `// Two Sum\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n}`,
        testcases: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }]
    },
    {
        title: "Reverse String",
        slug: "reverse-string",
        difficulty: "Easy",
        description: "Write a function that reverses a string. The input string is given as an array of characters `s`.",
        startercode: `// Reverse String\n#include <vector>\nusing namespace std;\n\nvoid reverseString(vector<char>& s) {\n    // Write your code here\n}`,
        testcases: [{ input: "s = ['h','e','l','l','o']", output: "['o','l','l','e','h']" }]
    },
    {
        title: "Palindrome Number",
        slug: "palindrome-number",
        difficulty: "Easy",
        description: "Given an integer `x`, return true if `x` is a palindrome, and false otherwise.",
        startercode: `// Palindrome Number\nusing namespace std;\n\nbool isPalindrome(int x) {\n    // Write your code here\n}`,
        testcases: [{ input: "x = 121", output: "true" }, { input: "x = -121", output: "false" }]
    }
];

const importData = async () => {
    try {
        await Problem.deleteMany();
        await Problem.insertMany(problems);
        console.log('✅ Problems Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
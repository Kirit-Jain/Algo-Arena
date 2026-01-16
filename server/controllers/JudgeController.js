const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const evaluateCode = async (req, res) => {
    try {
        const { code, problem, userId } = req.body;

        if (!code || !problem)
        {
            return res.status(400).json({ verdict: "Error", message: "Code and Problem are required" });
        }

        console.log("Judge is analyzing code...");

        const prompt = `
            Act as a Strict Competitive Programming Judge.
            
            Problem Name: ${problem}
            Submitted C++ Code:
            ${code}
            
            Rubric for Scoring (0 to 10):
            - **Correctness (max 5 pts):** Does it solve the problem? (0 if fails).
            - **Time Complexity (max 3 pts):** Is it the optimal Big-O? (3 for optimal, 1 for brute force).
            - **Code Quality (max 2 pts):** Clean variable names, modularity, no unused code.

            Task:
            1. Analyze the code against the problem requirements.
            2. Assign a Score (0-10) based on the rubric.
            3. Determine the Time Complexity.

            Output Format:
            Return ONLY a raw JSON string (no markdown, no backticks) with this structure:
            {
                "verdict": "Accepted" or "Wrong Answer" or "Compilation Error",
                "score": Integer (0-10),
                "complexity": "e.g., O(n)",
                "message": "Short feedback justifying the score."            
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const judgeResult = JSON.parse(text);

        console.log(`Judge Result -> Verdict: ${judgeResult.verdict}, Score: ${judgeResult.score}`);

        res.json(judgeResult);
    } catch (error) {
        if (error.status === 503) {
            console.error("Gemini Model Overloaded, retrying might work.");
            // You can choose to return a specific message to the frontend
            return res.status(503).json({ message: "AI is currently busy. Please try again in a moment." });
        }
        console.error("AI Judge Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { evaluateCode };
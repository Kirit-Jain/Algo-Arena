const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./database'); 

//importing models (schema)
const User = require('./models/User');

// Import Routes
const judgeRoutes = require('./routes/JudgeRoutes');
const problemRoutes = require('./routes/Problems');
const authRoutes = require('./routes/auth');   

// Import Socket Manager
const setupGameManager = require('./game/GameManager');

require('dotenv').config();

// 1. App Configuration
const app = express();
app.use(cors());
app.use(express.json());

// 2. Database Connection
connectDB();

// 3. Server Initialization
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            process.env.CLIENT_URL,
            "http://localhost:5173", 
            "https://algo-arena-ten.vercel.app"
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
});

// 4. Routes (Mounting)
app.use('/api/judge', judgeRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/auth', authRoutes);

app.get("/api/leaderboard", async (req, res) => {
    try {
        const topPlayers = await User.find({}, "username score wins")
            .sort({ score: -1 })
            .limit(10);

        res.json(topPlayers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// 5. Socket Logic
setupGameManager(io);

// 6. Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
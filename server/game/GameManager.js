const User = require('../models/User');
const Problem = require('../models/Problem');

const roomScores = {};

// --- HELPER FUNCTION: UPDATE DATABASE ON WIN ---
async function awardWin(userId) {
    if (!userId) return;
    try {
        await User.findByIdAndUpdate(userId, { $inc: { wins: 1, score: 20 } });
        console.log(`Win recorded for User: ${userId}`);
    } catch (error) {
        console.log("DB error: ", error);
    }
}

// --- HELPER FUNCTION: FETCH RANDOM PROBLEM FROM DB ---
async function getRandomProblemSlug() {
    try {
        const problems = await Problem.find({}, 'slug');

        if (!problems || problems.length === 0) {
            console.error("No problem found in DB!");
            return null;
        }

        const randomIndex = Math.floor(Math.random() * problems.length);
        return problems[randomIndex].slug;
    } catch (error) {
        console.error("Error fetching problem: ", error);
        return null;
    }
}

const GAME_DURATION = 10 * 60 * 1000;

let waitingPlayer = null;

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`User Connected: ${socket.id}`);

        // --- MATCH MAKING BLOCK ---
        socket.on("find_match", (data) => {
            const { userId, username } = data;
            console.log(`User ${username} (${userId}) is looking for a match...`);

            if (waitingPlayer)
            {
                if (waitingPlayer.userId === userId) 
                {
                    return;
                }

                const opponent = waitingPlayer;
                
                const p1Name = opponent.username.replace(/[^a-zA-Z0-9]/g, "");
                const p2Name = username.replace(/[^a-zA-Z0-9]/g, "");

                const roomName = `match_${p1Name}_${p2Name}`;

                if (opponent.socket.connected)
                {
                    opponent.socket.emit("match_found", { roomId: roomName });
                    socket.emit("match_found", { roomId: roomName });
                    console.log(`MATCH FOUND ${opponent.userId} vs ${userId}`);
                }
                else
                {
                    console.log(`⚠️ Opponent ${opponent.userId} disconnected while waiting. Resetting queue.`);
                    waitingPlayer = { socket, userId };
                }

                waitingPlayer = null;
            }

            else
            {
                waitingPlayer = { socket, userId, username };
                console.log("⏳ User added to waiting queue.");
            }
        })

        // --- HANDLE USER JOINING A ROOM ---
        // --- HANDLE USER JOINING A ROOM ---
        socket.on("join_room", async (payload) => {
            let roomId, userId;

            if (typeof payload === 'object' && payload !== null) 
            {
                roomId = payload.roomId;
                userId = payload.userId;
            } 
            else if (typeof payload === 'string') 
            {
                roomId = payload;
                userId = null;
            } 
            else 
            {
                return;
            }

            if (!roomId) 
            {
                socket.emit("error", { message: "Invalid Room ID" });
                return;
            }

            const room = roomId.trim();

            if (!roomScores[room]) 
            {
                roomScores[room] = {};
            }

            if (roomScores[room][socket.id]) return;

            for (const socketId in roomScores[room]) 
            {
                if (roomScores[room][socketId].userId === userId) 
                {
                    delete roomScores[room][socketId];
                }
            }

            const currentPlayers = Object.keys(roomScores[room]);
            if (currentPlayers.length >= 2) 
            {
                socket.emit("error", { message: "Room is full!" });
                return;
            }

            // --- JOIN LOGIC ---
            socket.join(room);
            roomScores[room][socket.id] = { score: null, userId: userId };
            console.log(`User with ID: ${socket.id} joined room: ${room}`);

            // --- GAME START LOGIC ---
            const players = Object.keys(roomScores[room]);

            if (players.length === 2) 
            {
                console.log(`Room ${room} is full. Waiting for clients to load...`);

                setTimeout(async () => {
                    // Check if users are still connected after the delay
                    if (!roomScores[room] || Object.keys(roomScores[room]).length < 2) return;

                    console.log(`Fetching random problem for Room ${room}...`);
                    const randomSlug = await getRandomProblemSlug();

                    if (randomSlug) 
                    {
                        const endTime = Date.now() + GAME_DURATION;

                        io.to(room).emit("game_start", {
                            problemSlug: randomSlug,
                            endTime: endTime
                        });

                        console.log(`Room ${room}: Game Started`);

                        // --- START SERVER TIMER ---
                        roomScores[room].timer = setTimeout(() => {
                            if (roomScores[room]) 
                            {
                                console.log(`⏰ Time Up for Room ${room}`);
                                io.to(room).emit("game_over", {
                                    result: "⏰ Time up. It's a draw.",
                                    p1Score: 0,
                                    p2Score: 0
                                });
                                delete roomScores[room];
                            }
                        }, GAME_DURATION);
                    } 
                    else 
                    {
                        io.to(room).emit("error", { message: "Could not fetch problem." });
                    }
                }, 2000);
            }
        });

        // --- HANDLE TYPING STATUS UPDATES ---
        socket.on("send_status", async (data) => {
            socket.to(data.room).emit("receive_status", data);
        });

        // --- HANDLE CODE SUBMISSION AND WINNER CALCULATION ---
        socket.on("submission_result", async (data) => {
            const { room, score, userId, verdict } = data;

            if (!roomScores[room]) {
                roomScores[room] = {};
            }

            roomScores[room][socket.id] = { score: score, userId: userId, verdict: verdict };

            socket.to(room).emit("receive_status", { status: "OpponentSubmitted" });

            if (verdict === "Accepted")
            {
                console.log(`room ${room}: Instant Win by ${userId}`);

                await awardWin(userId);

                if (roomScores[room].timer) clearTimeOut(roomScores[room].timer);

                io.to(room).emnit("game_over", {
                    result: "Game Over",
                    winner: userId,
                    message: "Correct Solution Found!",
                    p1Score: score,
                    p2Score: 0
                });

                delete roomScores[room];
                return;
            }

            const players = Object.values(roomScores[room] || {});
            const allSubmitted = players.length === 2 && players.every(p => p.verdict !== null && p.verdict !== undefined);

            if (allSubmitted) {
                console.log(`Room ${room}: Game Over. Calculating winner...`);
                
                const [p1, p2] = players;
                let resultMessage = "Draw - Both Wrong";
                let winnerId = null;

                if (p1.score > p2.score) 
                {
                    winnerId = p1.userId;
                    resultMessage = "Player 1 Wins!";
                } 
                else if (p2.score > p1.score) 
                {
                    winnerId = p2.userId;
                    resultMessage = "Player 2 Wins!";
                }

                if (winnerId) {
                    await awardWin(winnerId);
                }

                if (roomScores[room].timer)
                {
                    clearTimeout(roomScores[room].timer);
                }

                io.to(room).emit("game_over", {
                    result: resultMessage,
                    winner: winnerId,
                    message: "Both players submitted.",
                    p1Score: p1.score,
                    p2Score: p2.score
                });

                delete roomScores[room];
            }
        });

        // --- HANDLE DISCONNECT AND CLEANUP ---
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
            
            if (waitingPlayer && waitingPlayer.socket.id === socket.id)
            {
                console.log("👋 Waiting player left the queue.")
                waitingPlayer = null;
            }

            for (const roomId in roomScores) {
                if (roomScores[roomId][socket.id]) {
                    delete roomScores[roomId][socket.id];
                    console.log(`Removed ${socket.id} from room ${roomId}`);
                    
                    if (Object.keys(roomScores[roomId]).length === 0) {
                        if (roomScores[roomId].timer) clearTimeout(roomScores[roomId].timer);
                        delete roomScores[roomId];
                    }
                    break; 
                }
            }
        });

        socket.on("leave_room", ({ roomId }) => {
             if (roomScores[roomId]) {
                 // Remove the specific socket
                 if (roomScores[roomId][socket.id]) delete roomScores[roomId][socket.id];
                 
                 // If empty, clean up
                 if (Object.keys(roomScores[roomId]).length === 0) {
                     if (roomScores[roomId].timer) clearTimeout(roomScores[roomId].timer);
                     delete roomScores[roomId];
                 }
             }
        });
    });
};
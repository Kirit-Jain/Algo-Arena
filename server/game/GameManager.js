const User = require('../models/User');
const Problem = require('../models/Problem');

const roomScores = {};

// --- HELPER FUNCTIONS ---
async function awardWin(userId) {
    if (!userId) return;
    try {
        await User.findByIdAndUpdate(userId, { $inc: { wins: 1, score: 20 } });
        console.log(`Win recorded for User: ${userId}`);
    } catch (error) {
        console.log("DB error: ", error);
    }
}

async function getRandomProblemSlug() {
    try {
        const problems = await Problem.find({}, 'slug');
        if (!problems || problems.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * problems.length);
        return problems[randomIndex].slug;
    } catch (error) {
        return null;
    }
}

const GAME_DURATION = 10 * 60 * 1000;
let waitingPlayer = null;

module.exports = (io) => {
    io.on("connection", (socket) => {
        
        // --- MATCHMAKING ---
        socket.on("find_match", (data) => {
            const { userId, username } = data;
            
            if (waitingPlayer) {
                if (waitingPlayer.userId === userId) return;
                const opponent = waitingPlayer;
                const p1Name = opponent.username.replace(/[^a-zA-Z0-9]/g, "");
                const p2Name = username.replace(/[^a-zA-Z0-9]/g, "");
                const roomName = `match_${p1Name}_${p2Name}`;

                if (opponent.socket.connected) {
                    opponent.socket.emit("match_found", { roomId: roomName });
                    socket.emit("match_found", { roomId: roomName });
                } else {
                    waitingPlayer = { socket, userId, username };
                }
                waitingPlayer = null;
            } else {
                waitingPlayer = { socket, userId, username };
            }
        });

        // --- JOIN ROOM & TIMER LOGIC ---
        socket.on("join_room", async (payload) => {
            const roomId = typeof payload === 'object' ? payload.roomId : payload;
            const userId = typeof payload === 'object' ? payload.userId : null;
            
            if (!roomId) return;
            const room = roomId.trim();

            if (!roomScores[room]) roomScores[room] = {};
            if (roomScores[room][socket.id]) return;

            for (const sId in roomScores[room]) {
                if (roomScores[room][sId].userId === userId) delete roomScores[room][sId];
            }

            if (Object.keys(roomScores[room]).length >= 2) {
                socket.emit("error", { message: "Room is full!" });
                return;
            }

            socket.join(room);
            roomScores[room][socket.id] = { score: 0, userId: userId, verdict: null };

            const players = Object.keys(roomScores[room]);
            if (players.length === 2) {
                setTimeout(async () => {
                    if (!roomScores[room] || Object.keys(roomScores[room]).length < 2) return;
                    
                    const randomSlug = await getRandomProblemSlug();
                    if (randomSlug) {
                        const endTime = Date.now() + GAME_DURATION;
                        io.to(room).emit("game_start", { problemSlug: randomSlug, endTime });

                        roomScores[room].timer = setTimeout(async () => {
                            if (roomScores[room]) {
                                const pList = Object.values(roomScores[room]);
                                let resultMsg = "Time up! It's a draw.";
                                let winner = null;
                                
                                const s1 = pList[0]?.score || 0;
                                const s2 = pList[1]?.score || 0;

                                if (s1 > s2) {
                                    winner = pList[0].userId;
                                    resultMsg = "Time up! Player 1 Wins!";
                                } else if (s2 > s1) {
                                    winner = pList[1].userId;
                                    resultMsg = "Time up! Player 2 Wins!";
                                }

                                if (winner) await awardWin(winner);

                                io.to(room).emit("game_over", {
                                    result: resultMsg,
                                    winner: winner,
                                    p1Score: s1,
                                    p2Score: s2
                                });
                                delete roomScores[room];
                            }
                        }, GAME_DURATION);
                    }
                }, 2000);
            }
        });

        // --- SUBMISSION HANDLING ---
        socket.on("submission_result", async (data) => {
            const { room, score, userId, verdict } = data;
            
            if (!roomScores[room]) roomScores[room] = {};
            
            roomScores[room][socket.id] = { score, userId, verdict };
            socket.to(room).emit("receive_status", { status: "Opponent Submitted" });

            if (verdict === "Accepted") {
                if (roomScores[room].timer) clearTimeout(roomScores[room].timer);
                await awardWin(userId);
                
                io.to(room).emit("game_over", {
                    result: "Game Over",
                    winner: userId,
                    message: "Correct Solution Found!",
                    p1Score: score, 
                    p2Score: 0
                });
                delete roomScores[room];
                return;
            }

            const pList = Object.values(roomScores[room]);
            const allSubmitted = pList.length === 2 && pList.every(p => p.verdict !== null);

            if (allSubmitted) {
                if (roomScores[room].timer) clearTimeout(roomScores[room].timer);
                
                let resultMsg = "Draw - Both Wrong";
                let winner = null;
                const s1 = pList[0].score || 0;
                const s2 = pList[1].score || 0;

                if (s1 > s2) {
                    winner = pList[0].userId;
                    resultMsg = "Player 1 Wins!";
                } else if (s2 > s1) {
                    winner = pList[1].userId;
                    resultMsg = "Player 2 Wins!";
                }

                if (winner) await awardWin(winner);

                io.to(room).emit("game_over", {
                    result: resultMsg,
                    winner: winner,
                    p1Score: s1,
                    p2Score: s2
                });
                delete roomScores[room];
            }
        });

        // --- DISCONNECT HANDLING ---
        socket.on("disconnect", () => {
             if (waitingPlayer && waitingPlayer.socket.id === socket.id) waitingPlayer = null;
             
             for (const roomId in roomScores) {
                 if (roomScores[roomId][socket.id]) {
                     delete roomScores[roomId][socket.id];
                     if (Object.keys(roomScores[roomId]).length === 0) {
                         if (roomScores[roomId].timer) clearTimeout(roomScores[roomId].timer);
                         delete roomScores[roomId];
                     }
                 }
             }
        });

        socket.on("send_status", (data) => socket.to(data.room).emit("receive_status", data));
    });
};
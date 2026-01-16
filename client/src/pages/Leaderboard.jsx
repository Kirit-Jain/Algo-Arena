import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Leaderboard = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const myUsername = localStorage.getItem("username");

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/leaderboard`);
                setPlayers(res.data);
            } catch (error) {
                console.log("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return "👑";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return `#${index + 1}`
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px' }}>
            
            <h1 style={{ fontSize: '3rem', color: '#ffd700', marginBottom: '10px' }}>🏆 Hall of Fame</h1>
            <p style={{ color: '#aaa', marginBottom: '40px' }}>Top Warriors of the Arena</p>

            <div style={{ width: '100%', maxWidth: '600px', background: '#2d2d2d', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '20px' }}>Loading Ranks...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #444', color: '#888', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Rank</th>
                                <th style={{ padding: '10px' }}>Warrior</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Wins</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player, index) => (
                                <tr 
                                    key={player._id} 
                                    style={{ 
                                        borderBottom: '1px solid #333', 
                                        backgroundColor: player.username === myUsername ? 'rgba(76, 175, 80, 0.2)' : 'transparent' 
                                    }}
                                >
                                    <td style={{ padding: '15px', fontSize: '1.2rem' }}>{getRankIcon(index)}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: player.username === myUsername ? '#4caf50' : 'white' }}>
                                        {player.username} {player.username === myUsername && "(You)"}
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center', color: '#aaa' }}>{player.wins} ⚔️</td>
                                    <td style={{ padding: '15px', textAlign: 'right', color: '#ffd700', fontWeight: 'bold' }}>{player.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <button 
                onClick={() => navigate('/')}
                style={{ marginTop: '30px', padding: '10px 20px', background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '5px', cursor: 'pointer' }}
            >
                ← Back to Lobby
            </button>
        </div>
    );
};

export default Leaderboard;
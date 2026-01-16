import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import LogoutButton from '../components/LogoutButton';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io.connect(API_URL);

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const username = localStorage.getItem("username") || "guest"

    useEffect(() => {
        socket.on("match_found", (data) => {
            console.log("match found! Joining: ", data.roomId);
            setIsSearching(false);
            navigate(`/game/${data.roomId}`);
        });

        return () => {
            socket.off("match_found");
        };
    }, [navigate]);

    const handleBattleMatch = () => {
        setIsSearching(true);
        const userId = localStorage.getItem("userId");
        socket.emit("find_match", { userId, username });
    };

    const handleCreateRoom = () => {
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        navigate(`/game/${randomId}`);
    };

    const handleJoinRoom = () => {
        if (roomId.trim()) {
            // Trim removes accidental spaces from copy-pasting
            navigate(`/game/${roomId.trim()}`); 
        } else {
            alert("Please enter a valid Room ID!");
        }
    };

    return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', color: 'white' }}>
      
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffd700' }}>
           👋 Hi, {username}
        </span>
        <LogoutButton />
      </div>

      <h1 style={{ fontSize: '3rem', marginBottom: '40px' }}>Algo Arena ⚔️</h1>

      <button 
        onClick={() => navigate('/leaderboard')}
        style={{ 
            marginBottom: '40px', 
            padding: '10px 25px', 
            backgroundColor: '#ffd700', 
            color: 'black', 
            border: 'none', 
            borderRadius: '25px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            fontSize: '1rem'
        }}
      >
        🏆 VIEW LEADERBOARD
      </button>

      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* Battle Match Button */}
         <div style={{ background: '#2d2d2d', padding: '30px', borderRadius: '10px', width: '300px', textAlign: 'center' }}>
          <h2>🔥 Battle Match</h2>
          <p style={{ color: '#aaa' }}>Find a random opponent.</p>
          <button onClick={handleBattleMatch} disabled={isSearching} style={{ /* styles */ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: isSearching ? '#555' : '#ff9800', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold', cursor: isSearching ? 'default' : 'pointer' }}>
            {isSearching ? "SEARCHING..." : "FIND MATCH 🔎"}
          </button>
        </div>

        {/* Custom Room Card */}
        <div style={{ background: '#2d2d2d', padding: '30px', borderRadius: '10px', width: '300px', textAlign: 'center' }}>
          <h2>🤝 Custom Room</h2>
          <p style={{ color: '#aaa' }}>Play with a friend.</p>
          <button onClick={handleCreateRoom} style={{ width: '100%', padding: '10px', marginBottom: '10px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            CREATE ROOM
          </button>
          <div style={{ display: 'flex', gap: '5px' }}>
             <input placeholder="Enter Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: 'white' }} />
             <button onClick={handleJoinRoom} style={{ padding: '10px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>JOIN</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
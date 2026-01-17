import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

import CodeEditor from '../components/CodeEditor';
import LogoutButton from '../components/LogoutButton';
import LeaveRoomButton from '../components/LeaveRoomButton';
import SubmitButton from '../components/SubmitButton';
import GameOverModal from '../components/GameOverModal';


const API_URL = import.meta.env.VITE_API_URL;
const socket = io.connect(API_URL);

const GamePage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(roomId);
  const [joined, setJoined] = useState(false);
  const [opponentStatus, setOpponentStatus] = useState("Idle");
  const [judgeOutput, setJudgeOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [code, setCode] = useState("// Loading...");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [gameResult, setGameResult] = useState({ result: "", p1: 0, p2: 0 });
  const [showPointAnimation, setShowPointsAnimation] = useState(false);

  const [timeLeft, setTimeLeft] = useState(false);
  const timerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
  

  useEffect(() => {
    if (roomId) {
      const userId = localStorage.getItem("userId");
      socket.emit("join_room",{ roomId, userId });
      setJoined(true);
    }

    socket.on("game_start", (data) => {
      console.log("Game Starting with: ", data.problemSlug);
      fetchProblem(data.problemSlug);

      const secondsRemaining = Math.floor((data.endTime - Date.now()) / 1000);
      setTimeLeft(secondsRemaining);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1)
          {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on("error", (data) => {
      alert(data.message);
      window.location.href = "/";
    });

    socket.on("receive_status", (data) => setOpponentStatus(data.status));

    socket.on("game_over", (data) => {
      clearInterval(timerRef.current);

      const myUserId = localStorage.getItem("userId");

      if (!myUserId) 
      {
        console.error("User ID missing in storage!");

      }

      let displayText = data.result;

      if (data.winner) {
        if (data.winner === myUserId) {
             displayText = "🎉 YOU WON!";
             setShowPointsAnimation(true);
             setTimeout(() => setShowPointsAnimation(false), 2000);
        } else {
             displayText = "💀 YOU LOST";
        }
      }

      setGameResult({
        result: displayText,
        p1: data.p1Score,
        p2: data.p2Score
      });
      setShowModal(true);
    });

    const handleBeforeUnload = () => {
      socket.emit("leave_room", { roomId });
      socket.disconnect();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.off("game_start");
      socket.off("receive_status");
      socket.off("error");
      socket.off("game_over");

      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomId]);

  const fetchProblem = async (slug) => {
    try {
      const res = await axios.get(`${API_URL}/api/problems/${slug}`);
      setCurrentProblem(res.data);
      setCode(res.data.startercode);
      setJudgeOutput(null);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const runCode = async () => {
    setLoading(true);
    setJudgeOutput(null);
    socket.emit("send_status", { room, status: "Submitting..." });

    setIsSubmitted(true);

    try {
      const response = await axios.post(`${API_URL}/api/judge`, {
        code: code,
        problem: currentProblem ? currentProblem.title : "Unknown",
        userId: localStorage.getItem("userId"),
      });

      const result = response.data;
      setJudgeOutput(result);

      const verdict = response.verdict;
      const finalScore = verdict === "Accepted" ? result.score : 0;

      socket.emit("submission_result", {
        room: room,
        score: finalScore,
        userId: localStorage.getItem("userId"),
        verdict: verdict,
      });

    } catch (error) {
      console.error(error);
      setJudgeOutput({ verdict: "Error", message: "Judge Offline" });
      setIsSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("send_status", { room, status: "Typing..." });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("send_status", { room, status: "Idle" });
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>

      {showModal && (
        <GameOverModal
          result={gameResult.result}
          p1Score={gameResult.p1}
          p2Score={gameResult.p2}
          onClose={() => window.location.href = "/"}
        />
      )}
      
      <div style={{ flexShrink: 0, padding: '10px', backgroundColor: '#2d2d2d', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2>Algo Arena ⚔️</h2>

          <div style={{ marginLeft: '30px', fontSize: '1.2rem', fontFamily: 'monospace', color: timeLeft < 60 ? '#f44336' : 'white', border: '1px solid #555', padding: '5px 10px', borderRadius: '4px' }}>
            ⏱️ {formatTime(timeLeft)}
          </div>

          {currentProblem ? (
            <span style={{ color: '#fff', fontWeight: 'bold', marginLeft: '20px' }}>
              Current Challenge: {currentProblem.title}
            </span>
          ) : (
            <span style={{ color: 'yellow', marginLeft: '20px' }}>Waiting for opponent...</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

          <span style={{ color: '#ffd700', fontWeight: 'bold', marginRight: '10px' }}>
            {localStorage.getItem("username") || "Player"}
          </span>

          {joined && (
            <span style={{ color: "#4caf50", marginRight: '15px' }}>Room: {room} | Opponent: {opponentStatus}</span>
          )}

          <LeaveRoomButton />
          <LogoutButton />
        </div>

        {showPointAnimation && (
          <div className="points-float" style={{ position: 'fixed', right: '300px', top: '80px', zIndex: 9999 }}>
            +20 PTS 🚀
          </div>
        )}

      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#1e1e1e', color: '#ccc', display: 'flex', flexDirection: 'column', borderRight: '1px solid #444' }}>
          {currentProblem ? (
            <div>
              <h3 style={{ color: 'white', marginTop: 0 }}>{currentProblem.title}</h3>
              <p>{currentProblem.description}</p>
            </div>
          ) : <p>Loading...</p>}

          <div style={{ marginTop: 'auto', height: '200px', backgroundColor: 'black', padding: '10px', fontFamily: 'monospace' }}>
            <strong style={{ color: '#888' }}>JUDGE TERMINAL_</strong>
            <hr style={{ borderColor: '#333' }} />
            {loading && <p style={{ color: 'yellow' }}>Running Tests...</p>}
            {judgeOutput && (
              <div>
                <p>Verdict: <strong style={{ color: judgeOutput.verdict === "Accepted" ? '#4caf50' : '#f44336' }}>{judgeOutput.verdict}</strong></p>
                <p>Msg: {judgeOutput.message}</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <CodeEditor 
              code={code} 
              onChange={handleCodeChange} 
              readOnly={isSubmitted}
            />
          </div>
          <SubmitButton 
            onClick={runCode} 
            loading={loading} 
            disabled={isSubmitted}
          />
        </div>

      </div>
    </div>
  );
};

export default GamePage;



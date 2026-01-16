import React from 'react';

const GameOverModal = ({ result, p1Score, p2Score, onClose }) => {
    const isWin = result.includes("You Won") || result.includes("Player 1 Wins");

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ borderColor: isWin ? '#4caf50' : '#f44336' }}>
                <h1 className="modal-title">{result === "Draw" ? "🤝 It's a draw" : result}</h1>

                <div className="modal-score">
                    <p>Your Score: <span style={{ color: 'white'}}>{p1Score}</span></p>
                    <p>Opponent: <span style={{ color: 'white' }}>{p2Score}</span></p>
                </div>

                <button className="modal-score" onClick={onClose}>
                    RETURN TO LOBBY 🏠
                </button>
            </div>
        </div>
    );
};

export default GameOverModal;
import React from 'react';

const GameOverModal = ({ result, p1Score, p2Score, onClose, onReview }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#2d2d2d',
                padding: '40px',
                borderRadius: '15px',
                textAlign: 'center',
                border: '2px solid #ffd700',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                maxWidth: '400px',
                width: '90%'
            }}>
                <h1 style={{ fontSize: '3rem', margin: '0 0 20px 0', color: 'white' }}>
                    {result}
                </h1>
                
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px', fontSize: '1.2rem', color: '#ccc' }}>
                    <div>
                        <p style={{ margin: 0 }}>Your Score</p>
                        <strong style={{ color: '#4caf50', fontSize: '1.5rem' }}>{p1Score}</strong>
                    </div>
                    <div>
                        <p style={{ margin: 0 }}>Opponent</p>
                        <strong style={{ color: '#f44336', fontSize: '1.5rem' }}>{p2Score}</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                        onClick={onClose}
                        style={{
                            padding: '12px 24px',
                            fontSize: '1.1rem',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        RETURN TO LOBBY 🏠
                    </button>

                    <button 
                        onClick={onReview}
                        style={{
                            padding: '10px 24px',
                            fontSize: '1rem',
                            backgroundColor: 'transparent',
                            color: '#ffd700',
                            border: '1px solid #ffd700',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        STAY & CHAT (5 MIN) 💬
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameOverModal;
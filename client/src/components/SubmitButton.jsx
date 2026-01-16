import React from 'react';

const SubmitButton = ({ onClick, loading }) => {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            style={{
                height: '50px', 
                backgroundColor: loading ? '#555' : '#28a745',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                transition: 'background-color 0.3s ease'
            }}
        >
            {loading ? "JUDGING..." : "SUBMIT SOLUTION 🚀"}
        </button>
    );
};

export default SubmitButton;
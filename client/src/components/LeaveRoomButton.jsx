import React from 'react';

const LeaveRoomButton = () => {
    const handleLeaveRoom = () => {
        window.location.href = "/";
    }

    return (
        <button
            onClick={handleLeaveRoom}
            style={{ padding: '8px 16px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                LEAVE ROOM
        </button>
    );
};

export default LeaveRoomButton;
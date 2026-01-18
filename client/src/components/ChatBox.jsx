import React, { useState, useEffect, useRef } from 'react';

const ChatBox = ({ socket, roomId }) => {
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const messagesEndRef = useRef(null);
    const username = localStorage.getItem("username") || "Player";

    const sendMessage = async (e) => {
        e.preventDefault();
        if(currentMessage.trim !== "")
        {
            const messageData = {
                room: roomId,
                author: username,
                message: currentMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
            };

            await socket.emit("send_message", messageData);

            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    useEffect(() => {
        const receiveMessageHandler = (data) => {
            setMessageList((list) => [...list, data]);
        };

        socket.on("receive_message", receiveMessageHandler);

        return () => {
            socket.off("receive_message", receiveMessageHandler);
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messageList]);

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            backgroundColor: '#1e1e1e', 
            borderLeft: '1px solid #444',
            width: '300px' 
        }}>
            {/* Header */}
            <div style={{ padding: '10px', borderBottom: '1px solid #444', backgroundColor: '#2d2d2d', fontWeight: 'bold', color: '#ffd700' }}>
                💬 Room Chat
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messageList.map((msg, index) => {
                    const isMe = msg.author === username;
                    return (
                        <div key={index} style={{ 
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            backgroundColor: isMe ? '#4caf50' : '#333',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            fontSize: '0.9rem'
                        }}>
                            <div style={{ fontSize: '0.7rem', color: isMe ? '#e8f5e9' : '#aaa', marginBottom: '2px', fontWeight: 'bold' }}>
                                {msg.author} <span style={{ fontWeight: 'normal' }}>{msg.time}</span>
                            </div>
                            <div>{msg.message}</div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} style={{ padding: '10px', borderTop: '1px solid #444', display: 'flex', gap: '5px' }}>
                <input
                    type="text"
                    value={currentMessage}
                    placeholder="Type a message..."
                    onChange={(event) => setCurrentMessage(event.target.value)}
                    style={{ 
                        flex: 1, 
                        padding: '8px', 
                        borderRadius: '5px', 
                        border: '1px solid #555', 
                        backgroundColor: '#2d2d2d', 
                        color: 'white',
                        outline: 'none'
                    }}
                />
                <button type="submit" style={{ 
                    padding: '8px 12px', 
                    backgroundColor: '#2196f3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}>
                    ➤
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
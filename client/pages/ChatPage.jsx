// client/src/pages/ChatPage.jsx
import React, { useEffect, useState } from 'react';
import { useSocket } from '../src/socket';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import UserList from '../components/UserList';

export default function ChatPage({ username, onLogout, backendUrl }) {
  const {
    socket,
    isConnected,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    setTyping,
    sendPrivateMessage,
    joinRoom,
    markMessageRead,
  } = useSocket(backendUrl);

  const [room, setRoom] = useState('global');

  useEffect(() => {
    // Connect on mount with username
    connect(username);

    // Join default room
    socket?.emit('join_room', room);

    return () => disconnect();
  }, []); // eslint-disable-line

  useEffect(() => {
    // Join new room whenever it changes
    joinRoom(room);
  }, [room]); // eslint-disable-line

  const handleLogout = () => {
    disconnect();
    onLogout();
  };

  return (
    <div className="chat-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h3>Socket Chat</h3>
          <div className="user-info">
            <strong>{username}</strong>
            <div className={`status ${isConnected ? 'online' : 'offline'}`}>
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        <UserList
          users={users}
          onPrivate={(id) => {
            const msg = prompt('Type private message:');
            if (msg) sendPrivateMessage(id, msg, (ack) => console.log('private ack', ack));
          }}
        />

        <div className="sidebar-bottom">
          <button onClick={() => setRoom('global')}>Global</button>
          <button onClick={() => setRoom('room-1')}>Room 1</button>
          <button onClick={() => setRoom('room-2')}>Room 2</button>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="chat-main">
        <div className="chat-header">
          <h4>{room === 'global' ? 'Global Chat' : room}</h4>
        </div>

        <MessageList
          messages={messages.filter(m => (m.room || 'global') === room)}
          markRead={(messageId) => markMessageRead(messageId, room)}
        />

        <TypingIndicator typingUsers={typingUsers} />

        <MessageInput
          room={room}
          onSend={(msg) => sendMessage(msg, room, (ack) => console.log('sent ack', ack))}
          onTyping={(isTyping) => setTyping(isTyping, room)}
          onSendFile={(dataUrl, filename) =>
            socket?.emit('file_message', { dataUrl, filename, room }, (ack) =>
              console.log('file ack', ack)
            )
          }
        />
      </main>
    </div>
  );
}

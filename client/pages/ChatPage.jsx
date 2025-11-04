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
    connect(username);
    socket?.emit('join_room', room);
    return () => disconnect();
  }, []); // eslint-disable-line

  useEffect(() => {
    joinRoom(room);
  }, [room]); // eslint-disable-line

  const handleLogout = () => {
    disconnect();
    onLogout();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="md:w-64 w-full md:h-full h-auto bg-gray-800/90 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold mb-4">Socket Chat</h3>
          <div className="mb-6">
            <strong>{username}</strong>
            <div
              className={`text-sm ${
                isConnected ? 'text-teal-400' : 'text-gray-400'
              }`}
            >
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>

          <UserList
            users={users}
            onPrivate={(id) => {
              const msg = prompt('Type private message:');
              if (msg)
                sendPrivateMessage(id, msg, (ack) => console.log('private ack', ack));
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            className={`px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition ${
              room === 'global' ? 'bg-teal-400 text-gray-900' : ''
            }`}
            onClick={() => setRoom('global')}
          >
            Global
          </button>
          <button
            className={`px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition ${
              room === 'room-1' ? 'bg-teal-400 text-gray-900' : ''
            }`}
            onClick={() => setRoom('room-1')}
          >
            Room 1
          </button>
          <button
            className={`px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition ${
              room === 'room-2' ? 'bg-teal-400 text-gray-900' : ''
            }`}
            onClick={() => setRoom('room-2')}
          >
            Room 2
          </button>
          <button
            className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-500 transition ml-auto"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Chat main */}
      <main className="flex-1 flex flex-col">
        <div className="chat-header p-4 border-b border-gray-700">
          <h4 className="font-semibold text-lg">
            {room === 'global' ? 'Global Chat' : room}
          </h4>
        </div>

        <MessageList
          messages={messages.filter((m) => (m.room || 'global') === room)}
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

// client/socket.js (enhanced)
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Prefer build-time VITE_SOCKET_URL; fall back to the Render URL in case it's not set
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://real-time-communication-with-socket-io-p7fh.onrender.com';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  // you can pass auth: { token } when connecting for JWT flows
});

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const connect = (username, token) => {
    if (token) socket.auth = { token };
    socket.connect();
    if (username) socket.emit('user_join', username);
  };

  const disconnect = () => {
    socket.disconnect();
  };

  const joinRoom = (room) => {
    socket.emit('join_room', room, (res) => {
      // handle callback if needed
    });
  };

  // send message with ack
  const sendMessage = (message, room, cb) => {
    socket.emit('send_message', { message, room }, (ack) => {
      // ack: {status, id, timestamp}
      if (cb) cb(ack);
    });
  };

  const sendPrivateMessage = (toSocketId, message, cb) => {
    socket.emit('private_message', { toSocketId, message }, (ack) => {
      if (cb) cb(ack);
    });
  };

  const sendFile = (dataUrl, filename, room, cb) => {
    socket.emit('file_message', { dataUrl, filename, room }, (ack) => {
      if (cb) cb(ack);
    });
  };

  const setTyping = (isTyping, room) => {
    socket.emit('typing', { isTyping, room });
  };

  const reactToMessage = (messageId, room, reaction, cb) => {
    socket.emit('message_reaction', { messageId, room, reaction }, (ack) => {
      if (cb) cb(ack);
    });
  };

  const markMessageRead = (messageId, room) => {
    socket.emit('message_read', { messageId, room });
  };

  // Listen for events
  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onReceive = (msg) => setMessages(prev => [...prev, msg]);
    const onPrivate = (msg) => setMessages(prev => [...prev, msg]);
    const onUserList = (list) => setUsers(list);
    const onUserJoined = (u) => setMessages(prev => [...prev, { system: true, message: `${u.username} joined` }]);
    const onUserLeft = (u) => setMessages(prev => [...prev, { system: true, message: `${u.username} left` }]);
    const onTypingUsers = (list) => setTypingUsers(list);
    const onMessageReaction = (payload) => {
      // update local messages if needed
      setMessages(prev => prev.map(m => m.id === payload.messageId ? { ...m, reactions: { ...(m.reactions||{}), [payload.reaction]: payload.reactors } } : m));
    };
    const onMessageRead = (payload) => {
      // show read receipt
      setMessages(prev => prev.map(m => m.id === payload.messageId ? { ...m, lastReadBy: payload.readerId } : m));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceive);
    socket.on('private_message', onPrivate);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
    socket.on('message_reaction', onMessageReaction);
    socket.on('message_read', onMessageRead);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceive);
      socket.off('private_message', onPrivate);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('message_reaction', onMessageReaction);
      socket.off('message_read', onMessageRead);
    };
  }, []);

  return {
    socket,
    isConnected,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    joinRoom,
    sendMessage,
    sendPrivateMessage,
    sendFile,
    setTyping,
    reactToMessage,
    markMessageRead,
  };
};

export default socket;

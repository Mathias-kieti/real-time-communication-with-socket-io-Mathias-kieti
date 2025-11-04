// client/src/App.jsx
import { useState } from 'react';
import LoginPage from '../pages/LoginPage';
import ChatPage from '../pages/ChatPage';
import './index.css';

function App() {
  const [username, setUsername] = useState('');

  const handleLogin = (name) => setUsername(name);
  const handleLogout = () => setUsername('');

  // Backend URL from environment variable
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  return username ? (
    <ChatPage
      username={username}
      onLogout={handleLogout}
      backendUrl={BACKEND_URL} // pass to ChatPage
    />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

export default App;

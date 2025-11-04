const BASE = import.meta.env.VITE_SOCKET_URL || 'https://real-time-communication-with-socket-io-p7fh.onrender.com';

export async function apiLogin(username) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  return res.json();
}

export async function fetchMessages(room = 'global', page = 1, limit = 20) {
  const res = await fetch(`${BASE}/api/messages?room=${room}&page=${page}&limit=${limit}`);
  return res.json();
}

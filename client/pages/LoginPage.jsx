import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (name || '').trim();
    if (!trimmed) return alert('Enter a valid username');
    onLogin(trimmed);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-gray-900 p-4">
      <div className="bg-gray-800/90 p-8 rounded-xl max-w-sm w-full shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Join Chat</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            placeholder="Enter a username (e.g. Matty)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            type="submit"
            className="w-full bg-teal-400 text-gray-900 font-bold p-3 rounded-md hover:bg-teal-500 transition"
          >
            Join
          </button>
        </form>
        <p className="text-gray-400 text-sm mt-4 text-center">
          No password required — username-only demo.
        </p>
      </div>
    </div>
  );
}

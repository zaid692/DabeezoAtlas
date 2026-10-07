'use client';
import { useState } from 'react';
import { login } from '../lib/auth'; // Add this import

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!form.email || !form.password) {
      setError('Email and password are required'); return;
    }

    try {
      const res = await fetch(`https://dabeez-backend.fly.dev/auth/login`, { // ✅ API replaced
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Login failed');
      else {
        setSuccess('Login successful!');
        login(data.token); // Store JWT token
        window.location.href = '/';
      }
    } catch {
      setError('Failed to connect to server');
    }
  };

  // REST OF YOUR EXISTING CODE REMAINS EXACTLY THE SAME
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-600 mb-4 text-center">{success}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded"/>
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-medium">Password *</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded"/>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

// lib/auth.js
const TOKEN_KEY = 'adminToken';
const API_URL = process.env.NEXT_PUBLIC_API_URL;
// ✅ Store token after successful login
export const login = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// ✅ Remove token and redirect to homepage
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '/'; // Redirect to home after logout
};

// ✅ Retrieve token from local storage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// ✅ Verify token by calling backend
export const isAuthenticated = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await fetch(`https://dabeez-backend.fly.dev/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok; // true if 200 OK
  } catch {
    return false;
  }
};

// ✅ Alias for admin check (same verification)
export const isAdmin = async () => {
  return await isAuthenticated();
};

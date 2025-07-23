import { apiRequest } from "./queryClient";

let currentUser = null;
let authToken = localStorage.getItem('auth_token');

export function getCurrentUser() {
  return currentUser;
}

export function getAuthToken() {
  return authToken;
}

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function setCurrentUser(user) {
  currentUser = user;
}

export async function login(data) {
  const response = await apiRequest('POST', '/api/auth/login', data);
  const result = await response.json();
  
  setAuthToken(result.token);
  setCurrentUser(result.user);
  
  return result;
}

export async function register(data) {
  const response = await apiRequest('POST', '/api/auth/register', data);
  const result = await response.json();
  
  setAuthToken(result.token);
  setCurrentUser(result.user);
  
  return result;
}

export async function logout() {
  setAuthToken(null);
  setCurrentUser(null);
}

export async function fetchCurrentUser() {
  if (!authToken) return null;
  
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (response.ok) {
      const user = await response.json();
      setCurrentUser(user);
      return user;
    } else {
      setAuthToken(null);
      setCurrentUser(null);
      return null;
    }
  } catch (error) {
    setAuthToken(null);
    setCurrentUser(null);
    return null;
  }
}

export async function initializeAuth() {
  if (authToken) {
    await fetchCurrentUser();
  }
}
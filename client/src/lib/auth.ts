import { apiRequest } from "./queryClient";
import { LoginData, RegisterData, User } from "@shared/schema";

let currentUser: User | null = null;
let authToken: string | null = localStorage.getItem('auth_token');

export function getCurrentUser(): User | null {
  return currentUser;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function setCurrentUser(user: User | null) {
  currentUser = user;
}

export async function login(data: LoginData): Promise<{ user: User; token: string }> {
  const response = await apiRequest('POST', '/api/auth/login', data);
  const result = await response.json();
  
  setAuthToken(result.token);
  setCurrentUser(result.user);
  
  return result;
}

export async function register(data: RegisterData): Promise<{ user: User; token: string }> {
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

export async function fetchCurrentUser(): Promise<User | null> {
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

// Initialize auth state on app load
export async function initializeAuth() {
  if (authToken) {
    await fetchCurrentUser();
  }
}

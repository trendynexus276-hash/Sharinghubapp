import { projectId, publicAnonKey } from "/utils/supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-506872b3`;

// Store access token in memory and localStorage
let accessToken: string | null = localStorage.getItem('sharingHubAccessToken');

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('sharingHubAccessToken', token);
  } else {
    localStorage.removeItem('sharingHubAccessToken');
  }
}

export function getAccessToken() {
  return accessToken;
}

// Fetch wrapper with authentication
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAccessToken();
  
  console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
  console.log(`   - Session Token: ${token ? token.substring(0, 20) + '...' : 'none'}`);
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // Always send Supabase anon key so Supabase allows the request through
    "Authorization": `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  // Send our custom session token for our app's authentication
  if (token) {
    headers["X-Session-Token"] = token;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ API Error: ${response.status}`, errorText);
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// ============ USER ACCOUNTS ============

export async function signUp(email: string, password: string, name: string) {
  const data = await fetchWithAuth(`${BASE_URL}/signup`, {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  return data;
}

export async function signIn(email: string, password: string) {
  const data = await fetchWithAuth(`${BASE_URL}/signin`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (data.accessToken) {
    setAccessToken(data.accessToken);
  }
  
  return data;
}

export function signOut() {
  setAccessToken(null);
}

// Debug function to check session
export async function checkSession() {
  const data = await fetchWithAuth(`${BASE_URL}/debug/session`);
  return data;
}

// ============ ITEMS ============

export async function getItems() {
  const data = await fetchWithAuth(`${BASE_URL}/items`);
  return data.items;
}

export async function getItemsByType(type: string) {
  const data = await fetchWithAuth(`${BASE_URL}/items/${type}`);
  return data.items;
}

export async function createItem(itemData: any) {
  const data = await fetchWithAuth(`${BASE_URL}/items`, {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
  return data.item;
}

export async function updateItem(itemId: string, updates: any) {
  const data = await fetchWithAuth(`${BASE_URL}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.item;
}

// ============ CHATS ============

export async function getChats() {
  const data = await fetchWithAuth(`${BASE_URL}/chats`);
  return data.chats;
}

export async function createChat(chatData: any) {
  const data = await fetchWithAuth(`${BASE_URL}/chats`, {
    method: 'POST',
    body: JSON.stringify(chatData),
  });
  return data.chat;
}

export async function addMessage(chatId: string, message: string, senderEmail: string, senderName: string) {
  const data = await fetchWithAuth(`${BASE_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message, senderEmail, senderName }),
  });
  return data;
}
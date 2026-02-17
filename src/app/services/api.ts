import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-506872b3`;

// Store access token
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('sharingHubAccessToken', token);
  } else {
    localStorage.removeItem('sharingHubAccessToken');
  }
}

export function getAccessToken(): string | null {
  if (!accessToken) {
    accessToken = localStorage.getItem('sharingHubAccessToken');
  }
  return accessToken;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
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

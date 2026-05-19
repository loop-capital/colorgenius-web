// COLORgenius API Client
// Connects to the existing web API at colorgenius.co

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://colorgenius.co/api';

// ─── Auth Token Management ───────────────────────────────────────

const TOKEN_KEY = 'cg_auth_token';

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ─── Core API Helper ─────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Health Check ────────────────────────────────────────────────

export async function healthCheck() {
  return apiRequest<{ status: string; timestamp: string }>('/health');
}

// ─── Formulation ─────────────────────────────────────────────────

export interface FormulationInput {
  currentLevel: number;
  currentTone: string;
  targetLevel: number;
  targetTone: string;
  condition?: {
    type?: 'virgin' | 'previously_colored' | 'damaged' | 'highly_damaged' | 'unknown';
    porosity?: 'low' | 'normal' | 'high';
    grayPercent?: number;
    highlights?: boolean;
    highlightedPercent?: number;
  };
  brandPreference?: string;
  linePreference?: string;
}

export async function submitFormulation(input: FormulationInput) {
  return apiRequest<{
    success: boolean;
    data: any;
    meta: { formulatedAt: string };
  }>('/formulate', {
    method: 'POST',
    body: input,
  });
}

// ─── Photos ──────────────────────────────────────────────────────

export interface PhotoUploadResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
    sessionId: string;
    angle: string;
    analysisStatus: string;
    createdAt: string;
  };
}

export async function uploadPhoto(
  imageUri: string,
  sessionId: string,
  angle: 'roots' | 'mid' | 'ends'
): Promise<PhotoUploadResponse> {
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const type = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  formData.append('sessionId', sessionId);
  formData.append('angle', angle);

  const token = await getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/photos/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `Upload failed: HTTP ${response.status}`);
  }

  return response.json();
}

export async function analyzePhoto(photoId: string) {
  return apiRequest<{ success: boolean; data: any }>(
    `/photos/${photoId}/analyze`,
    { method: 'POST' }
  );
}

export async function getPhotoAnalysis(photoId: string) {
  return apiRequest<{ success: boolean; data: any }>(
    `/photos/${photoId}/analysis`
  );
}

// ─── Clients ─────────────────────────────────────────────────────

export interface Client {
  id: string;
  salonId?: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  lastVisit?: string;
  visits?: number;
  conditions?: any[];
}

export async function getClients(search?: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiRequest<{ clients: Client[]; total: number }>(`/clients${params}`);
}

export async function getClient(id: string) {
  return apiRequest<{ client: Client }>(`/clients?id=${id}`);
}

export async function createClient(data: {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}) {
  return apiRequest<{ client: Client }>('/clients', {
    method: 'POST',
    body: data,
  });
}

// ─── Products ────────────────────────────────────────────────────

export async function getProducts() {
  return apiRequest<{ products: any[] }>('/products');
}

// ─── Formulation Saves ───────────────────────────────────────────

export async function saveFormulation(data: any) {
  return apiRequest<{ success: boolean; id: string }>('/formulations/save', {
    method: 'POST',
    body: data,
  });
}

// ─── Gallery / Community ─────────────────────────────────────────

export async function getPublicGallery(page = 1) {
  return apiRequest<{ photos: any[]; total: number }>(
    `/gallery/public?page=${page}`
  );
}

export async function getTrendingGallery() {
  return apiRequest<{ photos: any[] }>('/gallery/trending');
}

// ─── Marketplace ─────────────────────────────────────────────────

export async function browseMarketplace(params?: {
  page?: number;
  category?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);

  return apiRequest<{
    items: any[];
    total: number;
    page: number;
  }>(`/marketplace/browse?${query.toString()}`);
}

// ─── Salon Devices (BLE Scale) ───────────────────────────────────

export async function registerDevice(data: {
  name: string;
  type: string;
  macAddress?: string;
}) {
  return apiRequest<{ success: boolean; device: any }>('/salon/devices', {
    method: 'POST',
    body: data,
  });
}

export async function getDevices() {
  return apiRequest<{ devices: any[] }>('/salon/devices');
}

// COLORgenius API Client
// Connects to the existing web API at colorgenius.co

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://colorgenius.co/api';

// ─── Settings Keys ───────────────────────────────────────────────

const SETTINGS_NOTIFICATIONS_KEY = 'cg_settings_notifications';
const SETTINGS_DARK_MODE_KEY     = 'cg_settings_dark_mode';
const SETTINGS_AUTO_SYNC_KEY     = 'cg_settings_auto_sync';
const SETTINGS_DEFAULT_BRAND_KEY = 'cg_settings_default_brand';

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

export async function getSettings() {
  const [notifications, darkMode, autoSync] = await Promise.all([
    AsyncStorage.getItem(SETTINGS_NOTIFICATIONS_KEY).then(v => v !== null ? v === 'true' : true),
    AsyncStorage.getItem(SETTINGS_DARK_MODE_KEY).then(v => v !== null ? v === 'true' : false),
    AsyncStorage.getItem(SETTINGS_AUTO_SYNC_KEY).then(v => v !== null ? v === 'true' : true),
  ]);
  return { notifications, darkMode, autoSync };
}

export async function saveNotifications(value: boolean) {
  await AsyncStorage.setItem(SETTINGS_NOTIFICATIONS_KEY, String(value));
}

export async function saveDarkMode(value: boolean) {
  await AsyncStorage.setItem(SETTINGS_DARK_MODE_KEY, String(value));
}

export async function saveAutoSync(value: boolean) {
  await AsyncStorage.setItem(SETTINGS_AUTO_SYNC_KEY, String(value));
}

export async function saveDefaultBrand(brand: string) {
  await AsyncStorage.setItem(SETTINGS_DEFAULT_BRAND_KEY, brand);
}

export async function getDefaultBrand(): Promise<string | null> {
  return AsyncStorage.getItem(SETTINGS_DEFAULT_BRAND_KEY);
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
  hairType?: 'virgin' | 'previously_colored' | 'damaged' | 'highly_damaged' | 'unknown';
  texture?: 'fine' | 'medium' | 'coarse';
  hairPattern?: 'straight' | 'wavy' | 'curly' | 'coily';
  density?: 'thin' | 'medium' | 'thick';
  serviceType?: 'full_head' | 'retouch' | 'balayage' | 'foils' | 'corrective' | 'gloss_toner';
  chemicalHistory?: string[];
  sensitivities?: string[];
  lastChemicalService?: string;
  condition?: {
    type?: 'virgin' | 'previously_colored' | 'damaged' | 'highly_damaged' | 'unknown';
    porosity?: 'low' | 'normal' | 'high';
    grayPercent?: number;
    highlights?: boolean;
    highlightedPercent?: number;
    banding?: boolean;
    hotRoots?: boolean;
    previousLightener?: boolean;
    multipleColors?: boolean;
    greenCast?: boolean;
    muddyToner?: boolean;
    overAshy?: boolean;
    colorGrab?: boolean;
    hollowEnds?: boolean;
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

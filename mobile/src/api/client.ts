import {
  TONE_VALUE_MAP,
} from '../types';

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
  const raw = await AsyncStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  // Aggressively strip all non-visible ASCII and control characters that corrupt HTTP headers.
  // Token must be non-empty after stripping.
  const cleaned = raw.replace(/[^\x20-\x7E]/g, '').trim();
  return cleaned.length > 0 ? cleaned : null;
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getSettings() {
  try {
    const [notifications, darkMode, autoSync] = await Promise.all([
      AsyncStorage.getItem(SETTINGS_NOTIFICATIONS_KEY),
      AsyncStorage.getItem(SETTINGS_DARK_MODE_KEY),
      AsyncStorage.getItem(SETTINGS_AUTO_SYNC_KEY),
    ]);
    return {
      notifications: notifications !== null ? notifications === 'true' : true,
      darkMode: darkMode !== null ? darkMode === 'true' : false,
      autoSync: autoSync !== null ? autoSync === 'true' : true,
    };
  } catch (error) {
    console.error('[Settings] Failed to load settings:', error);
    // Return defaults on error
    return { notifications: true, darkMode: false, autoSync: true };
  }
}

export async function saveNotifications(value: boolean) {
  try {
    await AsyncStorage.setItem(SETTINGS_NOTIFICATIONS_KEY, String(value));
  } catch (error) {
    console.error('[Settings] Failed to save notifications:', error);
    throw error;
  }
}

export async function saveDarkMode(value: boolean) {
  try {
    await AsyncStorage.setItem(SETTINGS_DARK_MODE_KEY, String(value));
  } catch (error) {
    console.error('[Settings] Failed to save dark mode:', error);
    throw error;
  }
}

export async function saveAutoSync(value: boolean) {
  try {
    await AsyncStorage.setItem(SETTINGS_AUTO_SYNC_KEY, String(value));
  } catch (error) {
    console.error('[Settings] Failed to save auto sync:', error);
    throw error;
  }
}

export async function saveDefaultBrand(brand: string) {
  try {
    await AsyncStorage.setItem(SETTINGS_DEFAULT_BRAND_KEY, brand);
  } catch (error) {
    console.error('[Settings] Failed to save default brand:', error);
    throw error;
  }
}

export async function getDefaultBrand(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SETTINGS_DEFAULT_BRAND_KEY);
  } catch (error) {
    console.error('[Settings] Failed to load default brand:', error);
    return null;
  }
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
    const cleanToken = token.replace(/[^A-Za-z0-9._~+/=-]/g, '');
    if (cleanToken) headers['Authorization'] = 'Bearer ' + cleanToken;
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

export type { FormulationResult } from '../types';

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
    type?: 'virgin' | 'previously_colored' | 'damaged' | 'highly_damaged' | 'bleached' | 'gray_coverage' | 'oily_scalp' | 'dry_brittle' | 'unknown';
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
  // Convert single-letter tone codes to full tone names for the web API
  const currentToneName = TONE_VALUE_MAP[input.currentTone] || input.currentTone;
  const targetToneName = TONE_VALUE_MAP[input.targetTone] || input.targetTone;

  // Match web API field names exactly (camelCase)
  const body = {
    currentLevel: input.currentLevel,
    currentTone: currentToneName,
    targetLevel: input.targetLevel,
    targetTone: targetToneName,
    brandPreference: input.brandPreference,
    linePreference: input.linePreference,
    condition: input.condition,
  };

  return apiRequest<{
    success: boolean;
    data: any;
    meta: { formulatedAt: string };
  }>('/formulate', {
    method: 'POST',
    body,
  });
}

// ─── Photos ──────────────────────────────────────────────────────

export interface PhotoUploadResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
    uploadUrl?: string;
    sessionId: string;
    angle: string;
    analysisStatus: string;
    createdAt: string;
  };
}

/**
 * Upload a photo using the presigned URL flow.
 *
 * Step 1: POST /api/photos/upload with JSON to get a presigned R2 URL
 * Step 2: PUT the file bytes directly to the presigned URL
 *
 * NOTE: This requires expo-file-system. If not available, use uploadPhotoMultipart.
 */
export async function uploadPhoto(
  imageUri: string,
  sessionId: string,
  angle: 'roots' | 'mid' | 'ends'
): Promise<PhotoUploadResponse> {
  // Always use multipart upload (no expo-file-system dependency)
  return uploadPhotoMultipart(imageUri, sessionId, angle);
}

/**
 * Alternative upload using multipart/form-data (direct upload mode).
 * Use this if presigned URL flow has issues with R2.
 */
export async function uploadPhotoMultipart(
  imageUri: string,
  sessionId: string,
  angle: 'roots' | 'mid' | 'ends'
): Promise<PhotoUploadResponse> {
  // Determine content type
  const uriPath = imageUri.split('?')[0];
  const ext = uriPath.split('.').pop()?.toLowerCase() ?? '';
  const mimeType = ext === 'png' ? 'image/png'
    : ext === 'webp' ? 'image/webp'
    : 'image/jpeg';

  // Build multipart form data
  const formData = new FormData();

  // React Native FormData file upload
  // Use a proper File-like object for React Native
  const fileName = `photo-${Date.now()}.${ext || 'jpg'}`;
  formData.append('file', {
    uri: imageUri,
    name: fileName,
    type: mimeType,
  } as any);
  formData.append('sessionId', sessionId);
  formData.append('angle', angle);

  const token = await getAuthToken();

  // Build headers carefully — never send an Authorization header with an invalid/null token
  const headers: Record<string, string> = {};
  if (token) {
    const cleanToken = token.replace(/[^A-Za-z0-9._~+/=-]/g, '');
    if (cleanToken) {
      headers['Authorization'] = 'Bearer ' + cleanToken;
    }
  }

  const response = await fetch(`${API_BASE}/photos/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || `Upload failed: HTTP ${response.status}`);
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

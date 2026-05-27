import {
  TONE_VALUE_MAP,
} from '../types';

// COLORgenius API Client
// Connects to the existing web API at colorgenius.co

import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'https://colorgenius.co/api';

// ─── Settings Keys ───────────────────────────────────────────────

const SETTINGS_NOTIFICATIONS_KEY = 'cg_set_notif';
const SETTINGS_DARK_MODE_KEY     = 'cg_set_mode';
const SETTINGS_AUTO_SYNC_KEY     = 'cg_set_sync';
const SETTINGS_DEFAULT_BRAND_KEY = 'cg_set_brand';

// ─── Auth Token Management ───────────────────────────────────────

const TOKEN_KEY = 'cg_token';

export async function getAuthToken(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
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
    return { notifications: true, darkMode: false, autoSync: true };
  }
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

// ─── Retry Helper ────────────────────────────────────────────────

async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      // Don't retry permanent failures
      if (err.message?.includes('HTTP 401') || err.message?.includes('HTTP 403') ||
          err.message?.includes('HTTP 404') || err.message?.includes('HTTP 413') ||
          err.message?.includes('HTTP 415')) {
        throw err;
      }
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.log(`[Retry] Attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError || new Error('Retry failed');
}

// ─── Core API Helper ─────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
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
    throw new Error(`HTTP ${response.status}: ${error.error || 'Request failed'}`);
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
  const currentToneName = TONE_VALUE_MAP[input.currentTone] || input.currentTone;
  const targetToneName = TONE_VALUE_MAP[input.targetTone] || input.targetTone;

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

// ─── Auth / Login ──────────────────────────────────────────────

const BETA_EMAIL = 'beta@colorgenius.co';
const BETA_PASSWORD = 'beta2026colorgenius';

export async function ensureAuth(): Promise<string | null> {
  let token = await getAuthToken();
  if (token) return token;
  token = await loginBeta();
  return token;
}

export async function loginBeta(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: BETA_EMAIL, password: BETA_PASSWORD }),
    });

    if (!response.ok) {
      console.error('[Auth] Beta login failed:', response.status);
      return null;
    }

    const data = await response.json();
    const token: string | undefined = data.token || data.sessionToken;
    if (token) {
      await setAuthToken(token);
      return token;
    }
    return null;
  } catch (err) {
    console.error('[Auth] Beta login error:', err);
    return null;
  }
}

export async function loginWithCredentials(email: string, password: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.error('[Auth] Login failed:', response.status);
      return null;
    }

    const data = await response.json();
    const token: string | undefined = data.token || data.sessionToken;
    if (token) {
      await setAuthToken(token);
      return token;
    }
    return null;
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return null;
  }
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

export async function uploadPhoto(
  imageUri: string,
  sessionId: string,
  angle: 'roots' | 'mid' | 'ends'
): Promise<PhotoUploadResponse> {
  return retry(() => uploadPhotoMultipart(imageUri, sessionId, angle), 3, 1000);
}

export async function uploadPhotoMultipart(
  imageUri: string,
  sessionId: string,
  angle: 'roots' | 'mid' | 'ends'
): Promise<PhotoUploadResponse> {
  const uriPath = imageUri.split('?')[0];
  const ext = uriPath.split('.').pop()?.toLowerCase() ?? '';
  const mimeType = ext === 'png' ? 'image/png'
    : ext === 'webp' ? 'image/webp'
    : 'image/jpeg';

  const formData = new FormData();
  const fileName = `photo-${Date.now()}.${ext || 'jpg'}`;
  formData.append('file', {
    uri: imageUri,
    name: fileName,
    type: mimeType,
  } as any);
  formData.append('sessionId', sessionId);
  formData.append('angle', angle);

  const token = await ensureAuth();
  if (!token) {
    throw new Error('Not authenticated. Please log in and try again.');
  }

  const cleanToken = token.replace(/[^A-Za-z0-9._~+/=-]/g, '');
  const headers: Record<string, string> = {
    'Authorization': 'Bearer ' + cleanToken,
  };

  const response = await fetch(`${API_BASE}/photos/upload`, {
    method: 'POST',
    headers,
    body: formData as any,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(`HTTP ${response.status}: ${err.error || 'Upload failed'}`);
  }

  return response.json();
}

export async function analyzePhoto(photoId: string) {
  return retry(() => apiRequest<{ success: boolean; data: any }>(
    `/photos/${photoId}/analyze`,
    { method: 'POST' }
  ), 3, 1000);
}

export async function getPhotoAnalysis(photoId: string) {
  return apiRequest<{ success: boolean; data: any }>(
    `/photos/${photoId}/analysis`
  );
}

export async function waitForAnalysis(
  photoId: string,
  timeoutMs = 60000,
  intervalMs = 3000
): Promise<any | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const result = await getPhotoAnalysis(photoId);
      if (result.success && result.data) {
        const status = result.data.processing_status || result.data.status;
        if (status === 'completed' || status === 'success') {
          return result.data;
        }
        if (status === 'failed' || status === 'error') {
          throw new Error('Analysis failed');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('Analysis failed')) throw err;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  throw new Error('Analysis timed out. Please try again.');
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

// ─── Last Consultation ───────────────────────────────────────────

export interface LastConsultationData {
  texture: 'fine' | 'medium' | 'coarse';
  hairPattern: 'straight' | 'wavy' | 'curly' | 'coily';
  density: 'thin' | 'medium' | 'thick';
  currentLevel: number;
  currentTone: string;
  lastServiceType: string;
  chemicalHistory: string[];
  sensitivities: string[];
  lastChemicalService: string;
  serviceType: string;
  targetLevel: number;
  targetTone: string;
  conditionType: 'virgin' | 'previously_colored' | 'damaged' | 'highly_damaged' | 'bleached' | 'gray_coverage' | 'oily_scalp' | 'dry_brittle';
  porosity: 'low' | 'normal' | 'high';
  grayPercent: number;
  problemIndicators: string[];
}

export async function getClientLastConsultation(clientId: string) {
  return apiRequest<{ consultation: LastConsultationData | null }>(`/clients/${clientId}/last-consultation`);
}

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

// ─── Pricing Config ──────────────────────────────────────────────

export interface PricingConfig {
  costPlusMode: boolean;
  markupPercent: number;
  applyToColor: boolean;
  applyToDeveloper: boolean;
}

export async function getPricingConfig(): Promise<PricingConfig | null> {
  try {
    const data = await apiRequest<{ config: PricingConfig }>('/v1/pricing/config');
    return data.config;
  } catch {
    return null;
  }
}

export async function savePricingConfig(config: { markupPercent: number; applyToColor: boolean; applyToDeveloper: boolean }): Promise<boolean> {
  try {
    await apiRequest('/v1/pricing/config', {
      method: 'PUT',
      body: config,
    });
    return true;
  } catch {
    return false;
  }
}

// ─── History ─────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  clientId?: string;
  type: string;
  clientName: string;
  brand: string;
  serviceType: string;
  targetLevel: number;
  targetTone: string;
  satisfaction: number | null;
  createdAt: string;
}

export async function getHistory(params?: { search?: string; type?: string; from?: string; to?: string }): Promise<HistoryEntry[]> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.type) query.set('type', params.type);
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    const qs = query.toString();
    const data = await apiRequest<{ history: HistoryEntry[] }>(`/history${qs ? `?${qs}` : ''}`);
    return data.history || [];
  } catch {
    return [];
  }
}

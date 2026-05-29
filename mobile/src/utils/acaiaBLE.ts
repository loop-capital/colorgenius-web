/**
 * Acaia BLE Scale Integration — React Native / Expo
 *
 * Reverse-engineered protocol compatible with Acaia Pearl 2021, Lunar, and newer models.
 * Based on bpowers/btscale protocol (same as the web dashboard implementation).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  NATIVE MODULE REQUIREMENT                                          │
 * │  react-native-ble-plx requires native linking.                      │
 * │  Run: cd mobile && npx expo prebuild                                │
 * │  This generates ios/ and android/ native directories.               │
 * │  After prebuild, the BLE library will be linked automatically.      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * BLE UUIDs:
 *   Service:        00001820-0000-1000-8000-00805f9b34fb
 *   Characteristic: 00002a80-0000-1000-8000-00805f9b34fb
 *
 * Protocol flow:
 *   1. Scan → find device with name prefix ACAIA/PEARL/LUNAR/CINCO/ARIA
 *   2. Connect GATT → get service → get characteristic → subscribe to notifications
 *   3. Send identification request (non-fatal)
 *   4. Send weight request to start streaming
 *   5. Decode encrypted weight packets using proprietary cipher tables
 *   6. Heartbeat (weight request) every 10s to prevent scale auto-sleep
 */

import { Platform, PermissionsAndroid } from 'react-native';
import type { BleManager as BleManagerType, Device, Characteristic, State } from 'react-native-ble-plx';

let _BleManagerClass: typeof BleManagerType | null = null;
let _BleState: typeof State | null = null;

async function loadBlePlx() {
  if (_BleManagerClass) return;
  const mod = await import('react-native-ble-plx');
  _BleManagerClass = mod.BleManager;
  _BleState = mod.State;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const SCALE_SERVICE_UUID = '00001820-0000-1000-8000-00805f9b34fb';
export const SCALE_CHARACTERISTIC_UUID = '00002a80-0000-1000-8000-00805f9b34fb';

/** Scan timeout in milliseconds */
const SCAN_TIMEOUT_MS = 15_000;

/** Heartbeat interval to prevent scale auto-sleep (ms) */
const HEARTBEAT_INTERVAL_MS = 10_000;

/** Stability detection window (ms) */
const STABILITY_WINDOW_MS = 800;

/** Max reconnect attempts before giving up */
const MAX_RECONNECT_ATTEMPTS = 3;

/** Device name prefixes that match Acaia scales */
const ACAIA_NAME_PREFIXES = ['ACAIA', 'ARIA', 'PEARL', 'LUNAR', 'CINCO'];

const MAGIC1 = 0xdf;
const MAGIC2 = 0x78;
const MAX_PAYLOAD_LENGTH = 10;

// ─── Cipher Tables (proprietary Acaia encryption) ────────────────────────────

const TABLE1: number[] = [
  0x00, 0x76, 0x84, 0x50, 0xDB, 0xE4, 0x6F, 0xB2,
  0xFA, 0xFB, 0x4D, 0x4F, 0x8E, 0x57, 0x8C, 0x5F,
  0x9E, 0xAE, 0xB0, 0xB5, 0x5D, 0x96, 0x15, 0xB9,
  0x0F, 0xFC, 0xFD, 0x70, 0x1B, 0x80, 0xBB, 0xF4,
  0x93, 0xFE, 0xFF, 0x69, 0x68, 0x83, 0xCF, 0xA7,
  0xD2, 0xEB, 0x3C, 0x64, 0x41, 0x77, 0xC6, 0x86,
  0xCB, 0xD3, 0xDD, 0x48, 0xEE, 0xF0, 0x1E, 0x58,
  0x4C, 0x8A, 0x8F, 0xA4, 0x02, 0x4B, 0x06, 0x24,
  0x8D, 0xB7, 0xBF, 0x28, 0x63, 0xAD, 0xB8, 0x56,
  0x89, 0xA0, 0xC4, 0x51, 0xC5, 0x52, 0x27, 0x3D,
  0xC9, 0xD6, 0xDC, 0x42, 0x2C, 0xD7, 0xE6, 0xEF,
  0xF9, 0x35, 0xD9, 0xBC, 0x7A, 0x1F, 0x43, 0x6C,
  0x36, 0x38, 0x07, 0x94, 0x98, 0xD8, 0xE3, 0xB6,
  0x53, 0x3F, 0x0C, 0x92, 0x9A, 0xC2, 0xD1, 0xD5,
  0x34, 0x1D, 0x62, 0xA9, 0x20, 0x7E, 0xAC, 0x09,
  0x5E, 0x59, 0x31, 0x9C, 0xA3, 0x97, 0xB3, 0x74,
  0xC1, 0xED, 0xF2, 0x10, 0x2E, 0x4A, 0xE1, 0x23,
  0x2B, 0x81, 0xF7, 0x61, 0x19, 0x08, 0x1A, 0x39,
  0x65, 0x3E, 0x73, 0x3B, 0x7B, 0x0B, 0x67, 0x04,
  0x6A, 0x22, 0x46, 0x0E, 0x55, 0x66, 0x54, 0x01,
  0x45, 0x6B, 0x32, 0x8B, 0xAB, 0x18, 0xBA, 0xCC,
  0xD4, 0x26, 0xE2, 0xE7, 0x1C, 0x44, 0x14, 0x95,
  0x99, 0x85, 0xDA, 0x4E, 0x6E, 0xE0, 0xE8, 0x37,
  0xBE, 0xF3, 0x7F, 0xDF, 0xF6, 0xF8, 0x2D, 0x30,
  0x21, 0x13, 0x17, 0x0D, 0x16, 0x25, 0x5B, 0x33,
  0x11, 0x5C, 0x7C, 0x87, 0xA1, 0xBD, 0x05, 0x90,
  0x9F, 0xA6, 0x6D, 0xB4, 0xC7, 0xCA, 0xC3, 0x12,
  0x03, 0xE5, 0xDE, 0xE9, 0x9B, 0x88, 0x2F, 0xEA,
  0xEC, 0xC8, 0x29, 0x71, 0x49, 0x5A, 0x72, 0x47,
  0x7D, 0xA2, 0xA5, 0x91, 0xAF, 0xB1, 0x0A, 0xCD,
  0x60, 0xC0, 0x9D, 0x78, 0xCE, 0xD0, 0x79, 0x3A,
  0xAA, 0xA8, 0x2A, 0x40, 0xF1, 0x75, 0xF5, 0x82,
];

const TABLE2: number[] = [
  0x00, 0x9F, 0x3C, 0xD8, 0x97, 0xCE, 0x3E, 0x62,
  0x8D, 0x77, 0xEE, 0x95, 0x6A, 0xC3, 0x9B, 0x18,
  0x83, 0xC8, 0xD7, 0xC1, 0xAE, 0x16, 0xC4, 0xC2,
  0xA5, 0x8C, 0x8E, 0x1C, 0xAC, 0x71, 0x36, 0x5D,
  0x74, 0xC0, 0x99, 0x87, 0x3F, 0xC5, 0xA9, 0x4E,
  0x43, 0xE2, 0xFA, 0x88, 0x54, 0xBE, 0x84, 0xDE,
  0xBF, 0x7A, 0xA2, 0xC7, 0x70, 0x59, 0x60, 0xB7,
  0x61, 0x8F, 0xF7, 0x93, 0x2A, 0x4F, 0x91, 0x69,
  0xFB, 0x2C, 0x53, 0x5E, 0xAD, 0xA0, 0x9A, 0xE7,
  0x33, 0xE4, 0x85, 0x3D, 0x38, 0x0A, 0xB3, 0x0B,
  0x03, 0x4B, 0x4D, 0x68, 0x9E, 0x9C, 0x47, 0x0D,
  0x37, 0x79, 0xE5, 0xC6, 0xC9, 0x14, 0x78, 0x0F,
  0xF0, 0x8B, 0x72, 0x44, 0x2B, 0x90, 0x9D, 0x96,
  0x24, 0x23, 0x98, 0xA1, 0x5F, 0xD2, 0xB4, 0x06,
  0x1B, 0xE3, 0xE6, 0x92, 0x7F, 0xFD, 0x01, 0x2D,
  0xF3, 0xF6, 0x5C, 0x94, 0xCA, 0xE8, 0x75, 0xBA,
  0x1D, 0x89, 0xFF, 0x25, 0x02, 0xB1, 0x2F, 0xCB,
  0xDD, 0x48, 0x39, 0xA3, 0x0E, 0x40, 0x0C, 0x3A,
  0xCF, 0xEB, 0x6B, 0x20, 0x63, 0xAF, 0x15, 0x7D,
  0x64, 0xB0, 0x6C, 0xDC, 0x7B, 0xF2, 0x10, 0xD0,
  0x49, 0xCC, 0xE9, 0x7C, 0x3B, 0xEA, 0xD1, 0x27,
  0xF9, 0x73, 0xF8, 0xA4, 0x76, 0x45, 0x11, 0xEC,
  0x12, 0xED, 0x07, 0x7E, 0xD3, 0x13, 0x67, 0x41,
  0x46, 0x17, 0xA6, 0x1E, 0x5B, 0xCD, 0xB8, 0x42,
  0xF1, 0x80, 0x6D, 0xD6, 0x4A, 0x4C, 0x2E, 0xD4,
  0xE1, 0x50, 0xD5, 0x30, 0xA7, 0xEF, 0xF4, 0x26,
  0xF5, 0x6E, 0x28, 0x31, 0xA8, 0x6F, 0x51, 0x55,
  0x65, 0x5A, 0xB2, 0x04, 0x52, 0x32, 0xDA, 0xBB,
  0xB5, 0x86, 0xAA, 0x66, 0x05, 0xD9, 0x56, 0xAB,
  0xB6, 0xDB, 0xDF, 0x29, 0xE0, 0x81, 0x34, 0x57,
  0x35, 0xFC, 0x82, 0xB9, 0x1F, 0xFE, 0xBC, 0x8A,
  0xBD, 0x58, 0x08, 0x09, 0x19, 0x1A, 0x21, 0x22,
];

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AcaiaDevice {
  id: string;
  name: string;
  rssi: number;
  model: 'Pearl' | 'Lunar' | 'Unknown';
}

export interface ScaleState {
  weight: number;      // in grams
  unit: 'g' | 'oz';
  batteryLevel?: number;
  status: 'connected' | 'disconnected' | 'scanning' | 'error';
  error?: string;
}

export interface ScaleWeight {
  value: number;       // weight in grams
  unit: 'g' | 'oz';
  stable: boolean;     // weight hasn't changed recently
  timestamp: number;
}

export type ScaleEventType = 'weight' | 'connection' | 'error' | 'battery';

export interface ScaleEvent {
  type: ScaleEventType;
  weight?: ScaleWeight;
  connected?: boolean;
  error?: string;
  battery?: number;    // 0-100
}

// ─── Protocol Encoder/Decoder ────────────────────────────────────────────────

let sequenceId = 0;

function nextSequenceId(): number {
  const next = sequenceId;
  sequenceId = (sequenceId + 1) & 0xff;
  return next;
}

function encipher(out: Uint8Array, input: number[], seqId: number): void {
  for (let i = 0; i < out.byteLength; i++) {
    const offset = (input[i] + seqId) & 0xff;
    out[i] = TABLE1[offset];
  }
}

function decipher(input: Uint8Array, seqId: number): Uint8Array {
  const result = new Uint8Array(input.byteLength);
  for (let i = 0; i < input.byteLength; i++) {
    const offset = input[i] & 0xff;
    result[i] = (TABLE2[offset] - seqId) & 0xff;
  }
  return result;
}

function checksum(data: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i];
  return sum & 0xff;
}

function encodeMessage(msgType: number, payload: number[]): ArrayBuffer {
  if (payload.length > MAX_PAYLOAD_LENGTH) throw new Error('payload too long');
  const buf = new ArrayBuffer(8 + payload.length);
  const bytes = new Uint8Array(buf);
  const seqId = nextSequenceId();

  bytes[0] = MAGIC1;
  bytes[1] = MAGIC2;
  bytes[2] = 5 + payload.length;
  bytes[3] = msgType;
  bytes[4] = seqId;
  bytes[5] = 0; // id
  bytes[6] = payload.length & 0xff;

  const payloadOut = new Uint8Array(buf, 7, payload.length);
  encipher(payloadOut, payload, seqId);

  const contentsToChecksum = new Uint8Array(buf, 3, payload.length + 4);
  bytes[7 + payload.length] = checksum(contentsToChecksum);

  return buf;
}

function decodeMessage(data: ArrayBuffer): { type: number; value: number } | null {
  const len = data.byteLength;
  if (len < 8) return null;

  const bytes = new Uint8Array(data);
  if (bytes[0] !== MAGIC1 || bytes[1] !== MAGIC2) return null;

  const cs = checksum(new Uint8Array(data.slice(3, len - 1)));
  if (bytes[len - 1] !== cs) return null;

  const msgType = bytes[3];
  const seqId = bytes[4];
  const payloadIn = new Uint8Array(data.slice(7, len - 1));
  const payload = decipher(payloadIn, seqId);

  // Type 5 = weight response
  if (msgType === 5 && payload.length >= 7) {
    let value = ((payload[1] & 0xff) << 8) + (payload[0] & 0xff);
    for (let i = 0; i < payload[4]; i++) value /= 10;
    if ((payload[6] & 0x02) === 0x02) value *= -1;
    return { type: 5, value };
  }

  // Type 8 = battery response
  if (msgType === 8 && payload.length >= 1) {
    return { type: 8, value: payload[0] };
  }

  // Type 11 = settings response
  if (msgType === 11) {
    return { type: 11, value: 0 };
  }

  return { type: msgType, value: 0 };
}

// ─── Command Builders ────────────────────────────────────────────────────────

function buildWeightRequest(): ArrayBuffer {
  return encodeMessage(4, [0x01, 0x64, 0x01]); // period=1, time=100ms, type=1
}

function buildTareCommand(): ArrayBuffer {
  return encodeMessage(12, [0x00, 0x00]);
}

function buildBatteryRequest(): ArrayBuffer {
  return encodeMessage(2, []);
}

function buildIdentRequest(): ArrayBuffer {
  return encodeMessage(11, [0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
}

// ─── Base64 Helpers (react-native-ble-plx uses base64) ───────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // @ts-ignore — btoa is available in React Native's JS runtime
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // @ts-ignore — atob is available in React Native's JS runtime
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ─── Detect Acaia Scale Model ────────────────────────────────────────────────

function detectModel(name: string): AcaiaDevice['model'] {
  const lower = name.toLowerCase();
  if (lower.includes('lunar')) return 'Lunar';
  if (lower.includes('pearl')) return 'Pearl';
  return 'Unknown';
}

function isAcaiaDevice(name: string | null | undefined): boolean {
  if (!name) return false;
  const upper = name.toUpperCase();
  return ACAIA_NAME_PREFIXES.some((prefix) => upper.startsWith(prefix));
}

// ─── AcaiaBLE Class ──────────────────────────────────────────────────────────

export class AcaiaBLE {
  private manager: BleManagerType;
  private device: Device | null = null;
  private characteristic: Characteristic | null = null;
  private listeners: Map<string, Set<(e: ScaleEvent) => void>> = new Map();

  private _connected = false;
  private _weight = 0;
  private _tareOffset = 0;
  private _batteryLevel: number | undefined;
  private _reconnectAttempts = 0;
  private _scanning = false;

  // Timers
  private _heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private _stableTimer: ReturnType<typeof setTimeout> | null = null;
  private _connectionMonitor: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (!_BleManagerClass) {
      throw new Error('BleManager not loaded. Call getAcaiaBLE() instead.');
    }
    this.manager = new _BleManagerClass();
  }

  // ─── Public Getters ──────────────────────────────────────────────────────

  get connected(): boolean {
    return this._connected;
  }

  get scanning(): boolean {
    return this._scanning;
  }

  get weight(): number {
    return Math.max(0, this._weight - this._tareOffset);
  }

  get batteryLevel(): number | undefined {
    return this._batteryLevel;
  }

  get deviceName(): string {
    return this.device?.name || 'Acaia Scale';
  }

  get deviceId(): string {
    return this.device?.id || '';
  }

  get model(): AcaiaDevice['model'] {
    return detectModel(this.deviceName);
  }

  get info(): AcaiaDevice {
    return {
      id: this.deviceId,
      name: this.deviceName,
      rssi: 0, // TODO: RSSI tracking via monitorCharacteristicsForDevice
      model: this.model,
    };
  }

  get status(): ScaleState['status'] {
    if (this._connected) return 'connected';
    if (this._scanning) return 'scanning';
    return 'disconnected';
  }

  // ─── Event System ────────────────────────────────────────────────────────

  addEventListener(type: ScaleEventType, handler: (e: ScaleEvent) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(type: ScaleEventType, handler: (e: ScaleEvent) => void): void {
    this.listeners.get(type)?.delete(handler);
  }

  private emit(event: ScaleEvent): void {
    this.listeners.get(event.type)?.forEach((h) => h(event));
  }

  // ─── BLE State Check ─────────────────────────────────────────────────────

  /**
   * Check if BLE is available and request permissions.
   * Returns true if BLE is ready to use.
   */
  async checkBleAvailable(): Promise<{ available: boolean; error?: string }> {
    try {
      // TODO: After expo prebuild, this will work with the native BLE module.
      // For now, this check runs against the JS-only BleManager.
      const state = await this.manager.state();

      if (state !== _BleState!.PoweredOn) {
        const msg = `Bluetooth is ${state.toLowerCase()}. Please enable Bluetooth in Settings.`;
        return { available: false, error: msg };
      }

      // Request Android permissions
      if (Platform.OS === 'android') {
        const granted = await this.requestAndroidPermissions();
        if (!granted) {
          return { available: false, error: 'Bluetooth permissions denied. Grant permission in Settings.' };
        }
      }

      return { available: true };
    } catch (err: any) {
      return {
        available: false,
        error: `BLE initialization failed: ${err?.message || err}`,
      };
    }
  }

  private async requestAndroidPermissions(): Promise<boolean> {
    // Android 12+ requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT
    if (Platform.OS !== 'android') return true;

    try {
      const apiLevel = Platform.Version as number;

      if (apiLevel >= 31) {
        // Android 12+
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          results['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          results['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android 11 and below
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch {
      return false;
    }
  }

  // ─── Scan ────────────────────────────────────────────────────────────────

  /**
   * Scan for Acaia scale devices.
   * Returns a list of discovered devices.
   */
  async scan(): Promise<AcaiaDevice[]> {
    const { available, error } = await this.checkBleAvailable();
    if (!available) {
      this.emit({ type: 'error', error });
      throw new Error(error || 'BLE not available');
    }

    this._scanning = true;
    const discovered = new Map<string, AcaiaDevice>();

    return new Promise<AcaiaDevice[]>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.manager.stopDeviceScan();
        this._scanning = false;
        resolve(Array.from(discovered.values()));
      }, SCAN_TIMEOUT_MS);

      this.manager.startDeviceScan(
        [SCALE_SERVICE_UUID],
        { allowDuplicates: false },
        (error: any, device: any) => {
          if (error) {
            clearTimeout(timeout);
            this.manager.stopDeviceScan();
            this._scanning = false;
            const msg = `Scan failed: ${error.message}`;
            this.emit({ type: 'error', error: msg });
            reject(new Error(msg));
            return;
          }

          if (device && device.name && isAcaiaDevice(device.name)) {
            discovered.set(device.id, {
              id: device.id,
              name: device.name,
              rssi: device.rssi ?? 0,
              model: detectModel(device.name),
            });
          }
        }
      );
    });
  }

  // ─── Connect ─────────────────────────────────────────────────────────────

  /**
   * Connect to a specific Acaia scale device.
   * Sends the identification request and starts weight streaming.
   */
  async connect(deviceId: string): Promise<AcaiaDevice> {
    const { available, error } = await this.checkBleAvailable();
    if (!available) {
      this.emit({ type: 'error', error });
      throw new Error(error || 'BLE not available');
    }

    try {
      // Connect to device
      this.device = await this.manager.connectToDevice(deviceId, {
        timeout: 10_000,
      })!;

      // Discover services and characteristics
      await this.device!.discoverAllServicesAndCharacteristics();

      // Get the scale characteristic
      const services = await this.device!.services();
      const scaleService = services.find((s) => s.uuid.toLowerCase() === SCALE_SERVICE_UUID.toLowerCase());

      if (!scaleService) {
        throw new Error(`Scale service not found (UUID: ${SCALE_SERVICE_UUID})`);
      }

      const characteristics = await scaleService.characteristics();
      this.characteristic =
        characteristics.find((c) => c.uuid.toLowerCase() === SCALE_CHARACTERISTIC_UUID.toLowerCase()) ?? null;

      if (!this.characteristic) {
        throw new Error(`Scale characteristic not found (UUID: ${SCALE_CHARACTERISTIC_UUID})`);
      }

      // Subscribe to notifications
      await this.subscribeToNotifications();

      // Send identification request (non-fatal)
      try {
        await this.sendCommand(buildIdentRequest());
      } catch {
        // Identification is optional — some firmware versions don't need it
      }

      // Start weight streaming
      await this.sendCommand(buildWeightRequest());

      // Request battery level (non-fatal)
      try {
        await this.sendCommand(buildBatteryRequest());
      } catch {
        // Battery request is optional
      }

      this._connected = true;
      this._reconnectAttempts = 0;

      // Start heartbeat to prevent auto-sleep
      this.startHeartbeat();

      // Monitor connection state
      this.startConnectionMonitor();

      this.emit({ type: 'connection', connected: true });

      return this.info;
    } catch (err: any) {
      const msg = `Connection failed: ${err?.message || err}`;
      this.emit({ type: 'error', error: msg });
      throw new Error(msg);
    }
  }

  // ─── Notifications ───────────────────────────────────────────────────────

  private async subscribeToNotifications(): Promise<void> {
    if (!this.characteristic) return;

    this.characteristic.monitor((error, char) => {
      if (error) {
        this.emit({ type: 'error', error: `Notification error: ${error.message}` });
        return;
      }

      if (char?.value) {
        this.handleNotification(char.value);
      }
    });
  }

  private handleNotification(base64Value: string): void {
    try {
      const buffer = base64ToArrayBuffer(base64Value);
      const result = decodeMessage(buffer);

      if (!result) return;

      // Weight data (type 5)
      if (result.type === 5) {
        const prevWeight = this._weight;
        this._weight = result.value;

        // Detect stability (weight unchanged for STABILITY_WINDOW_MS)
        if (this._stableTimer) clearTimeout(this._stableTimer);
        this._stableTimer = setTimeout(() => {
          this.emit({
            type: 'weight',
            weight: { value: this.weight, unit: 'g', stable: true, timestamp: Date.now() },
          });
        }, STABILITY_WINDOW_MS);

        // Only emit if weight actually changed (≥ 0.1g)
        if (Math.abs(this._weight - prevWeight) >= 0.1) {
          this.emit({
            type: 'weight',
            weight: { value: this.weight, unit: 'g', stable: false, timestamp: Date.now() },
          });
        }
      }

      // Battery data (type 8)
      if (result.type === 8) {
        this._batteryLevel = result.value;
        this.emit({ type: 'battery', battery: result.value });
      }
    } catch {
      // Ignore malformed packets
    }
  }

  // ─── Commands ────────────────────────────────────────────────────────────

  /**
   * Tare (zero) the scale.
   */
  async tare(): Promise<void> {
    if (!this.characteristic || !this._connected) {
      throw new Error('Scale not connected');
    }

    this._tareOffset = this._weight;
    await this.sendCommand(buildTareCommand());

    this.emit({
      type: 'weight',
      weight: { value: 0, unit: 'g', stable: true, timestamp: Date.now() },
    });
  }

  /**
   * Request battery level from the scale.
   */
  async requestBattery(): Promise<void> {
    if (!this.characteristic || !this._connected) {
      throw new Error('Scale not connected');
    }
    await this.sendCommand(buildBatteryRequest());
  }

  private async sendCommand(buffer: ArrayBuffer): Promise<void> {
    if (!this.characteristic) throw new Error('No characteristic');

    const base64 = arrayBufferToBase64(buffer);
    await this.characteristic.writeWithResponse(base64);
  }

  // ─── Heartbeat ───────────────────────────────────────────────────────────

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this._heartbeatTimer = setInterval(async () => {
      if (!this._connected || !this.characteristic) return;

      try {
        await this.sendCommand(buildWeightRequest());
      } catch {
        // Heartbeat failed — connection may be lost
        // The connection monitor will handle reconnection
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }

  // ─── Connection Monitor ──────────────────────────────────────────────────

  private startConnectionMonitor(): void {
    this.stopConnectionMonitor();

    // Poll connection state every 5s
    this._connectionMonitor = setInterval(async () => {
      if (!this.device) return;

      try {
        const isConnected = await this.device.isConnected();
        if (!isConnected && this._connected) {
          this.handleDisconnect();
        }
      } catch {
        // Device may have been removed
        if (this._connected) {
          this.handleDisconnect();
        }
      }
    }, 5_000);
  }

  private stopConnectionMonitor(): void {
    if (this._connectionMonitor) {
      clearInterval(this._connectionMonitor);
      this._connectionMonitor = null;
    }
  }

  // ─── Disconnect / Reconnect ──────────────────────────────────────────────

  private async handleDisconnect(): Promise<void> {
    this._connected = false;
    this.stopHeartbeat();
    this.emit({ type: 'connection', connected: false });

    // Auto-reconnect
    if (this._reconnectAttempts < MAX_RECONNECT_ATTEMPTS && this.device) {
      this._reconnectAttempts++;
      const delay = 1000 * this._reconnectAttempts;

      await new Promise((r) => setTimeout(r, delay));

      try {
        await this.connect(this.device.id);
      } catch {
        this.emit({ type: 'error', error: 'Reconnect failed' });
      }
    }
  }

  /**
   * Cleanly disconnect from the scale.
   */
  async disconnect(): Promise<void> {
    this._reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // prevent auto-reconnect
    this.stopHeartbeat();
    this.stopConnectionMonitor();

    if (this.characteristic) {
      try {
        // react-native-ble-plx doesn't have explicit stopNotifications —
        // removing the monitor subscription is handled by the library
      } catch {
        // Ignore cleanup errors
      }
    }

    if (this.device) {
      try {
        await this.device.cancelConnection();
      } catch {
        // Ignore if already disconnected
      }
    }

    this._connected = false;
    this.device = null;
    this.characteristic = null;
    this._weight = 0;
    this._tareOffset = 0;
    this._batteryLevel = undefined;

    this.emit({ type: 'connection', connected: false });
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────

  /**
   * Destroy the BLE manager. Call when the app is unmounting.
   */
  destroy(): void {
    this.disconnect().catch(() => {});
    this.manager.destroy();
    this.listeners.clear();
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

let _instance: AcaiaBLE | null = null;
let _blePromise: Promise<AcaiaBLE> | null = null;

/** Ensure lazy BLE module is loaded before constructing */
async function ensureBleModule(): Promise<void> {
  if (_BleManagerClass) return;
  await loadBlePlx();
}

/**
 * Get the singleton AcaiaBLE instance.
 * Creates one if it doesn't exist.
 */
export async function getAcaiaBLE(): Promise<AcaiaBLE> {
  if (_instance) return _instance;
  if (!_blePromise) {
    _blePromise = ensureBleModule().then(() => {
      _instance = new AcaiaBLE();
      _blePromise = null;
      return _instance;
    });
  }
  return _blePromise;
}

/**
 * Synchronous getter — only safe *after* async init via {@link getAcaiaBLE}.
 */
export function getAcaiaBLESync(): AcaiaBLE | null {
  return _instance;
}

/**
 * Get the current singleton instance without creating one.
 * Returns null if no instance exists.
 */
export function getAcaiaBLEInstance(): AcaiaBLE | null {
  return _instance;
}

/**
 * Destroy the singleton instance. Call on app cleanup.
 */
export function destroyAcaiaBLE(): void {
  if (_instance) {
    _instance.destroy();
    _instance = null;
  }
}

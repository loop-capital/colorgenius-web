/**
 * Acaia BLE Protocol — Works with Pearl 2021, Lunar, and other Acaia scales
 * Based on reverse-engineered protocol from bpowers/btscale
 *
 * Both Pearl and Lunar use identical BLE protocol — supported simultaneously.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

export const SCALE_SERVICE_UUID = '00001820-0000-1000-8000-00805f9b34fb';
export const SCALE_CHARACTERISTIC_UUID = '00002a80-0000-1000-8000-00805f9b34fb';

const MAGIC1 = 0xdf;
const MAGIC2 = 0x78;
const MAX_PAYLOAD_LENGTH = 10;

// Encryption tables (proprietary Acaia cipher)
const TABLE1 = [
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

const TABLE2 = [
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

export interface ScaleWeight {
  value: number;      // weight in grams
  unit: 'g' | 'oz';
  stable: boolean;    // weight hasn't changed recently
  timestamp: number;
}

export interface ScaleDevice {
  id: string;
  name: string;
  model: 'Pearl' | 'Lunar' | 'Unknown';
}

export type ScaleEventType = 'weight' | 'connection' | 'error' | 'battery';

export interface ScaleEvent {
  type: ScaleEventType;
  weight?: ScaleWeight;
  connected?: boolean;
  error?: string;
  battery?: number;   // 0-100
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

// ─── AcaiaScale Class ───────────────────────────────────────────────────────

export class AcaiaScale {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private listeners: Map<string, Set<(e: ScaleEvent) => void>> = new Map();

  private _connected = false;
  private _weight: number = 0;
  private _tareOffset: number = 0;
  private _lastWeightTime: number = 0;
  private _stableTimeout: ReturnType<typeof setTimeout> | null = null;
  private _reconnectAttempts = 0;
  private _maxReconnectAttempts = 3;

  get connected(): boolean { return this._connected; }
  get weight(): number { return Math.max(0, this._weight - this._tareOffset); }
  get deviceName(): string { return this.device?.name || 'Acaia Scale'; }
  get deviceId(): string { return this.device?.id || ''; }

  get model(): ScaleDevice['model'] {
    const name = (this.device?.name || '').toLowerCase();
    if (name.includes('lunar')) return 'Lunar';
    if (name.includes('pearl')) return 'Pearl';
    return 'Unknown';
  }

  get info(): ScaleDevice {
    return { id: this.deviceId, name: this.deviceName, model: this.model };
  }

  addEventListener(type: ScaleEventType, handler: (e: ScaleEvent) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(type: ScaleEventType, handler: (e: ScaleEvent) => void): void {
    this.listeners.get(type)?.delete(handler);
  }

  private emit(event: ScaleEvent): void {
    this.listeners.get(event.type)?.forEach(h => h(event));
  }

  async connect(): Promise<ScaleDevice> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth is not supported in this browser. Use Chrome or Edge.');
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [SCALE_SERVICE_UUID] },
          { namePrefix: 'ACAIA' },
          { namePrefix: 'ARIA' },
          { namePrefix: 'PEARL' },
          { namePrefix: 'LUNAR' },
          { namePrefix: 'CINCO' },
        ],
        optionalServices: [SCALE_SERVICE_UUID],
      });

      this.device.addEventListener('gattserverdisconnected', () => this.handleDisconnect());

      await this.connectGatt();

      return this.info;
    } catch (err: any) {
      const msg = err?.message || String(err);
      this.emit({ type: 'error', error: msg });
      throw err;
    }
  }

  private async connectGatt(): Promise<void> {
    if (!this.device?.gatt) throw new Error('No GATT server');

    this.server = await this.device.gatt.connect();
    const service = await this.server.getPrimaryService(SCALE_SERVICE_UUID);
    this.characteristic = await service.getCharacteristic(SCALE_CHARACTERISTIC_UUID);

    await this.characteristic.startNotifications();
    this.characteristic.addEventListener('characteristicvaluechanged', (e: Event) => this.handleNotification(e));

    // Send identification request
    try {
      await this.characteristic.writeValue(buildIdentRequest());
    } catch {}

    // Start weight notifications
    await this.characteristic.writeValue(buildWeightRequest());

    // Request battery
    try {
      await this.characteristic.writeValue(buildBatteryRequest());
    } catch {}

    this._connected = true;
    this._reconnectAttempts = 0;
    this.emit({ type: 'connection', connected: true });
  }

  private async handleDisconnect(): Promise<void> {
    this._connected = false;
    this.emit({ type: 'connection', connected: false });

    // Auto-reconnect
    if (this._reconnectAttempts < this._maxReconnectAttempts) {
      this._reconnectAttempts++;
      await new Promise(r => setTimeout(r, 1000 * this._reconnectAttempts));
      try {
        await this.connectGatt();
      } catch {
        this.emit({ type: 'error', error: 'Reconnect failed' });
      }
    }
  }

  private handleNotification(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const result = decodeMessage(target.value!.buffer);

    if (!result) return;

    if (result.type === 5) {
      const prevWeight = this._weight;
      this._weight = result.value;
      this._lastWeightTime = Date.now();

      // Detect stability (weight unchanged for 800ms)
      if (this._stableTimeout) clearTimeout(this._stableTimeout);
      this._stableTimeout = setTimeout(() => {
        this.emit({
          type: 'weight',
          weight: { value: this.weight, unit: 'g', stable: true, timestamp: Date.now() },
        });
      }, 800);

      // Only emit if weight changed
      if (Math.abs(this._weight - prevWeight) >= 0.1) {
        this.emit({
          type: 'weight',
          weight: { value: this.weight, unit: 'g', stable: false, timestamp: Date.now() },
        });
      }
    }

    if (result.type === 8) {
      this.emit({ type: 'battery', battery: result.value });
    }
  }

  async tare(): Promise<void> {
    if (!this.characteristic || !this._connected) throw new Error('Scale not connected');

    this._tareOffset = this._weight;
    await this.characteristic.writeValue(buildTareCommand());

    this.emit({
      type: 'weight',
      weight: { value: 0, unit: 'g', stable: true, timestamp: Date.now() },
    });
  }

  async disconnect(): Promise<void> {
    this._reconnectAttempts = this._maxReconnectAttempts; // prevent auto-reconnect
    if (this.characteristic) {
      try { await this.characteristic.stopNotifications(); } catch {}
    }
    if (this.server) {
      try { this.server.disconnect(); } catch {}
    }
    this._connected = false;
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.emit({ type: 'connection', connected: false });
  }

  async getBattery(): Promise<void> {
    if (!this.characteristic || !this._connected) throw new Error('Scale not connected');
    await this.characteristic.writeValue(buildBatteryRequest());
  }
}

// ─── Singleton Manager (supports multiple scales) ────────────────────────────

const scaleInstances: Map<string, AcaiaScale> = new Map();

export function getScale(id?: string): AcaiaScale | undefined {
  if (id) return scaleInstances.get(id);
  return scaleInstances.values().next().value;
}

export function getAllScales(): AcaiaScale[] {
  return Array.from(scaleInstances.values());
}

export async function connectScale(): Promise<AcaiaScale> {
  const scale = new AcaiaScale();
  const info = await scale.connect();
  scaleInstances.set(info.id, scale);
  return scale;
}

export async function disconnectScale(id: string): Promise<void> {
  const scale = scaleInstances.get(id);
  if (scale) {
    await scale.disconnect();
    scaleInstances.delete(id);
  }
}

export async function disconnectAllScales(): Promise<void> {
  for (const scale of scaleInstances.values()) {
    await scale.disconnect();
  }
  scaleInstances.clear();
}

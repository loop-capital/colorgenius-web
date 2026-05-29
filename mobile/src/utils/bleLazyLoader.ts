/**
 * Lazy BLE module loader — prevents `react-native-ble-plx` from being required
 * at bundle time on iOS where it triggers native module resolution before
 * CocoaPods has run.
 *
 * Usage:
 *   import { getBleModule } from './bleLazyLoader';
 *   const { BleManager } = await getBleModule();
 */

let _bleModule: typeof import('react-native-ble-plx') | null = null;

export async function getBleModule(): Promise<typeof import('react-native-ble-plx')> {
  if (!_bleModule) {
    _bleModule = await import('react-native-ble-plx');
  }
  return _bleModule;
}

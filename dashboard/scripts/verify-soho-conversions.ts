// Manual verification script for SOHO manufacturer conversions
import { getManufacturerConversion, hasManufacturerMapping, getSupportedCHIBrands } from '../lib/conversion/manufacturer-conversions';

console.log('=== SOHO Manufacturer Conversion Tests ===\n');

// Forward lookups: SOHO → other brands
console.log('--- Forward: SOHO → Other Brands ---');
console.log('SOHO 5.0 → Kenra:', getManufacturerConversion('soho', 'kenra', '5.0'));
console.log('SOHO 7.3 → Wella:', getManufacturerConversion('soho', 'wella', '7.3'));
console.log('SOHO 6.4 → Schwarzkopf:', getManufacturerConversion('soho', 'schwarzkopf', '6.4'));
console.log('SOHO 4.6 → Kenra (X → null):', getManufacturerConversion('soho', 'kenra', '4.6'));
console.log('SOHO 10.6 → Kenra:', getManufacturerConversion('soho', 'kenra', '10.6'));

// Reverse lookups: other brands → SOHO
console.log('\n--- Reverse: Other Brands → SOHO ---');
console.log('Kenra 5G → SOHO:', getManufacturerConversion('kenra', 'soho', '5G'));
console.log('Wella 6/0 → SOHO:', getManufacturerConversion('wella', 'soho', '6/0'));
console.log('Wella 8/34 → SOHO:', getManufacturerConversion('wella', 'soho', '8/34'));
console.log('Paul Mitchell 5N → SOHO:', getManufacturerConversion('paul-mitchell', 'soho', '5N'));

// Non-SOHO conversions (should be null)
console.log('\n--- Non-SOHO conversions (should be null) ---');
console.log('Kenra → Wella:', getManufacturerConversion('kenra', 'wella', '5N'));
console.log('Matrix → Joico:', getManufacturerConversion('matrix', 'joico', '5N'));

// Utility functions
console.log('\n--- Utility Checks ---');
console.log('hasManufacturerMapping(soho → kenra):', hasManufacturerMapping('soho', 'kenra'));
console.log('hasManufacturerMapping(kenra → soho):', hasManufacturerMapping('kenra', 'soho'));
console.log('hasManufacturerMapping(kenra → wella):', hasManufacturerMapping('kenra', 'wella'));
console.log('Supported brands count:', getSupportedCHIBrands().length);
console.log('Supported brands:', getSupportedCHIBrands().slice(0, 5), '...');

console.log('\n=== All tests complete ===');

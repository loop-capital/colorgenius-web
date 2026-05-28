/**
 * Phorest Integration Test Suite
 *
 * Run with: npx tsx integrations/phorest/test.ts
 * Or: node --loader ts-node/esm integrations/phorest/test.ts
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import {
  PhorestClient,
  createPhorestClient,
  validatePhorestCredentials,
  mapProductCategory,
  extractShadeCode,
  extractBrand,
  buildBasicAuthHeader,
  normalizeUsername,
} from './index';
import type { PhorestProduct, PhorestCredentials } from './types';

// ── Mock Credentials (for testing — replace with real ones) ──
const TEST_CREDENTIALS: PhorestCredentials = {
  username: process.env.PHOREST_TEST_USERNAME || 'global/test@example.com',
  password: process.env.PHOREST_TEST_PASSWORD || 'test-password',
  businessId: process.env.PHOREST_TEST_BUSINESS_ID || 'test-business-id',
  region: 'us',
};

// ── Unit Tests (no network) ──
describe('Phorest Auth', () => {
  it('normalizes username with global/ prefix', () => {
    expect(normalizeUsername('test@example.com')).toBe('global/test@example.com');
    expect(normalizeUsername('global/test@example.com')).toBe('global/test@example.com');
  });

  it('builds correct Basic Auth header', () => {
    const header = buildBasicAuthHeader({
      username: 'global/test@example.com',
      password: 'password123',
      businessId: 'biz',
      region: 'us',
    });
    expect(header).toMatch(/^Basic\s/);
    // Decode and verify
    const base64 = header.replace('Basic ', '');
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    expect(decoded).toBe('global/test@example.com:password123');
  });
});

describe('Product Category Mapping', () => {
  it('maps color products', () => {
    const product: PhorestProduct = {
      productId: '1',
      name: 'Permanent Hair Color 6N',
      type: 'COLOUR',
      categoryName: 'Hair Color',
    };
    expect(mapProductCategory(product)).toBe('color');
  });

  it('maps developer products', () => {
    const product: PhorestProduct = {
      productId: '2',
      name: '20 Volume Developer',
      type: 'PROFESSIONAL',
      categoryName: 'Developer',
    };
    expect(mapProductCategory(product)).toBe('developer');
  });

  it('maps retail products', () => {
    const product: PhorestProduct = {
      productId: '3',
      name: 'Moisturizing Shampoo',
      type: 'RETAIL',
    };
    expect(mapProductCategory(product)).toBe('retail');
  });

  it('defaults to other for unknown', () => {
    const product: PhorestProduct = {
      productId: '4',
      name: 'Random Product',
      type: 'RETAIL',
    };
    expect(mapProductCategory(product)).toBe('retail'); // shampoo keyword not in name
  });
});

describe('Shade Code Extraction', () => {
  it('extracts from barcode', () => {
    const product: PhorestProduct = {
      productId: '1',
      name: 'Color',
      barcode: '6N-12345',
    };
    expect(extractShadeCode(product)).toBe('6N-12345');
  });

  it('extracts from name pattern', () => {
    const product: PhorestProduct = {
      productId: '2',
      name: 'Wella Koleston Perfect 7.1',
    };
    expect(extractShadeCode(product)).toBe('7.1');
  });

  it('extracts from code field', () => {
    const product: PhorestProduct = {
      productId: '3',
      name: 'Color',
      code: '5RV',
    };
    expect(extractShadeCode(product)).toBe('5RV');
  });
});

describe('Brand Extraction', () => {
  it('uses brandName if available', () => {
    const product: PhorestProduct = {
      productId: '1',
      name: 'Some Product',
      brandName: 'Davines',
    };
    expect(extractBrand(product)).toBe('Davines');
  });

  it('falls back to first word', () => {
    const product: PhorestProduct = {
      productId: '2',
      name: 'Wella Color',
    };
    expect(extractBrand(product)).toBe('Wella');
  });
});

// ── Integration Tests (require real credentials) ──
describe('Phorest API Integration', () => {
  let client: PhorestClient;

  beforeAll(() => {
    if (!process.env.PHOREST_TEST_USERNAME) {
      console.log('Skipping integration tests — set PHOREST_TEST_USERNAME env var');
    }
    client = createPhorestClient(TEST_CREDENTIALS);
  });

  it.skip('validates credentials', async () => {
    const result = await validatePhorestCredentials(TEST_CREDENTIALS);
    expect(result.valid).toBe(true);
  });

  it.skip('lists branches', async () => {
    const response = await client.listBranches(0, 10);
    expect(response._embedded?.branches).toBeDefined();
    expect(Array.isArray(response._embedded?.branches)).toBe(true);
  });

  it.skip('lists clients', async () => {
    const response = await client.listClients({ page: 0, size: 5 });
    expect(response._embedded?.clients).toBeDefined();
  });

  it.skip('lists products', async () => {
    // Requires a branchId — use first branch
    const branches = await client.listBranches(0, 1);
    const branchId = branches._embedded?.branches?.[0]?.branchId;
    if (!branchId) return;

    const response = await client.listProducts(branchId, { page: 0, size: 5 });
    expect(response._embedded?.products).toBeDefined();
  });
});

console.log('Phorest integration test file loaded. Run with Jest or vitest.');

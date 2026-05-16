/**
 * Square Customers Sync Module
 * Fetch and normalize customer data from Square to UnifiedCustomer
 */

import { z } from 'zod';
import { SquareClient, SquareError } from './square-client';
import {
  type SquareCustomer,
  type UnifiedCustomer,
  type SquarePaginatedResponse,
} from './types';

// ---------------------------------------------------------------------------
// Zod schemas for runtime validation
// ---------------------------------------------------------------------------

const squareCustomerSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  email_address: z.string().email().optional(),
  phone_number: z.string().optional(),
  company_name: z.string().optional(),
  birthday: z.string().optional(),
  reference_id: z.string().optional(),
  note: z.string().optional(),
  address: z.object({
    address_line_1: z.string().optional(),
    address_line_2: z.string().optional(),
    locality: z.string().optional(),
    sublocality: z.string().optional(),
    administrative_district_level_1: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  preferences: z.object({
    email_unsubscribed: z.boolean().optional(),
  }).optional(),
  version: z.number(),
}).passthrough();

const squareCustomerListSchema = z.object({
  customers: z.array(z.unknown()).optional(),
  cursor: z.string().optional(),
  errors: z.array(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// SquareCustomers class
// ---------------------------------------------------------------------------

export class SquareCustomers {
  private readonly client: SquareClient;

  constructor(client: SquareClient) {
    this.client = client;
  }

  // -----------------------------------------------------------------------
  // Fetch
  // -----------------------------------------------------------------------

  /**
   * Fetch a single customer by Square customer ID
   */
  async getCustomer(merchantId: string, customerId: string): Promise<UnifiedCustomer | null> {
    try {
      const response = await this.client.get<{ customer?: unknown }>(
        merchantId,
        `/customers/${customerId}`,
      );

      if (!response.customer) return null;

      const validated = squareCustomerSchema.safeParse(response.customer);
      if (!validated.success) {
        throw new CustomerSyncError(
          'VALIDATION_FAILED',
          `Customer ${customerId} failed validation: ${validated.error.message}`,
        );
      }

      return this.normalizeCustomer(validated.data, merchantId);
    } catch (error) {
      if (error instanceof SquareError && error.code === 'NOT_FOUND') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Fetch all customers (paginated)
   */
  async getAllCustomers(merchantId: string): Promise<UnifiedCustomer[]> {
    const results: UnifiedCustomer[] = [];

    for await (const page of this.client.paginate<unknown>(
      merchantId,
      '/customers',
      { limit: 100 },
      'cursor',
      'customers',
    )) {
      for (const raw of page) {
        const validated = squareCustomerSchema.safeParse(raw);
        if (!validated.success) {
          console.warn(`Customer validation failed, skipping: ${validated.error.message}`);
          continue;
        }
        results.push(this.normalizeCustomer(validated.data, merchantId));
      }
    }

    return results;
  }

  /**
   * Fetch customers updated since a given timestamp
   */
  async getCustomersSince(
    merchantId: string,
    since: Date,
  ): Promise<UnifiedCustomer[]> {
    // Square doesn't support updated_at filter natively on list,
    // so we filter client-side. For large merchants, consider
    // using SearchCustomers API with a filter instead.
    const all = await this.getAllCustomers(merchantId);
    return all.filter((c) => new Date(c.updatedAt) >= since);
  }

  /**
   * Search customers using Square's SearchCustomers API
   */
  async searchCustomers(
    merchantId: string,
    options: {
      query?: string;
      email?: string;
      phone?: string;
      limit?: number;
      cursor?: string;
    } = {},
  ): Promise<{ customers: UnifiedCustomer[]; cursor?: string }> {
    const body: Record<string, unknown> = {};

    if (options.query) {
      body.query = {
        filter: {
          text_filter: {
            exact: options.query,
          },
        },
      };
    } else if (options.email || options.phone) {
      body.query = {
        filter: {
          email_address: options.email ? { exact: options.email } : undefined,
          phone_number: options.phone ? { exact: options.phone } : undefined,
        },
      };
    }

    if (options.limit) body.limit = options.limit;
    if (options.cursor) body.cursor = options.cursor;

    const response = await this.client.post<{
      customers?: unknown[];
      cursor?: string;
      errors?: unknown[];
    }>(merchantId, '/customers/search', body);

    if (response.errors?.length) {
      throw new CustomerSyncError(
        'SEARCH_FAILED',
        `Search failed: ${JSON.stringify(response.errors)}`,
      );
    }

    const customers: UnifiedCustomer[] = [];
    for (const raw of response.customers ?? []) {
      const validated = squareCustomerSchema.safeParse(raw);
      if (!validated.success) {
        console.warn(`Search result validation failed, skipping: ${validated.error.message}`);
        continue;
      }
      customers.push(this.normalizeCustomer(validated.data, merchantId));
    }

    return { customers, cursor: response.cursor };
  }

  // -----------------------------------------------------------------------
  // Create / Update
  // -----------------------------------------------------------------------

  /**
   * Create a customer in Square
   */
  async createCustomer(
    merchantId: string,
    customer: Partial<Omit<SquareCustomer, 'id' | 'created_at' | 'updated_at' | 'version'>>,
  ): Promise<UnifiedCustomer> {
    const body = {
      given_name: customer.given_name,
      family_name: customer.family_name,
      email_address: customer.email_address,
      phone_number: customer.phone_number,
      company_name: customer.company_name,
      birthday: customer.birthday,
      reference_id: customer.reference_id,
      note: customer.note,
      address: customer.address,
      preferences: customer.preferences,
    };

    const response = await this.client.post<{ customer?: unknown }>(
      merchantId,
      '/customers',
      body,
    );

    if (!response.customer) {
      throw new CustomerSyncError(
        'CREATE_FAILED',
        'Square returned no customer data on create',
      );
    }

    const validated = squareCustomerSchema.parse(response.customer);
    return this.normalizeCustomer(validated, merchantId);
  }

  /**
   * Update a customer in Square
   */
  async updateCustomer(
    merchantId: string,
    customerId: string,
    customer: Partial<Omit<SquareCustomer, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<UnifiedCustomer> {
    const body = {
      given_name: customer.given_name,
      family_name: customer.family_name,
      email_address: customer.email_address,
      phone_number: customer.phone_number,
      company_name: customer.company_name,
      birthday: customer.birthday,
      reference_id: customer.reference_id,
      note: customer.note,
      address: customer.address,
      preferences: customer.preferences,
    };

    const response = await this.client.put<{ customer?: unknown }>(
      merchantId,
      `/customers/${customerId}`,
      body,
    );

    if (!response.customer) {
      throw new CustomerSyncError(
        'UPDATE_FAILED',
        'Square returned no customer data on update',
      );
    }

    const validated = squareCustomerSchema.parse(response.customer);
    return this.normalizeCustomer(validated, merchantId);
  }

  /**
   * Delete a customer in Square
   */
  async deleteCustomer(merchantId: string, customerId: string): Promise<void> {
    await this.client.delete(merchantId, `/customers/${customerId}`);
  }

  // -----------------------------------------------------------------------
  // Normalization
  // -----------------------------------------------------------------------

  private normalizeCustomer(customer: SquareCustomer, merchantId: string): UnifiedCustomer {
    return {
      id: `sq_${customer.id}`, // internal composite ID
      externalId: customer.id,
      platform: 'square',
      merchantId,
      firstName: customer.given_name,
      lastName: customer.family_name,
      email: customer.email_address,
      phone: customer.phone_number,
      company: customer.company_name,
      birthday: customer.birthday,
      address: customer.address
        ? {
            line1: customer.address.address_line_1,
            line2: customer.address.address_line_2,
            city: customer.address.locality,
            district: customer.address.sublocality,
            state: customer.address.administrative_district_level_1,
            postalCode: customer.address.postal_code,
            country: customer.address.country,
          }
        : undefined,
      preferences: customer.preferences
        ? { emailUnsubscribed: customer.preferences.email_unsubscribed }
        : undefined,
      notes: customer.note,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      rawData: customer as unknown as Record<string, unknown>,
    };
  }
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class CustomerSyncError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'CustomerSyncError';
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomerSyncError);
    }
  }
}

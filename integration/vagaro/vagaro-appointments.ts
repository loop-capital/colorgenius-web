/**
 * Vagaro Appointments Sync Module
 * Fetches bookings and maps them to UnifiedAppointment.
 */

import {
  type VagaroAppointment,
  type UnifiedAppointment,
  type VagaroAppointmentListParams,
  VagaroAppointmentSchema,
  VagaroAppointmentStatusSchema,
  UnifiedAppointmentSchema,
  VagaroError,
  VagaroErrorCodeSchema,
} from "./types";
import { VagaroApiClient, getVagaroClient } from "./vagaro-client";

// ═══════════════════════════════════════════════════════════════
// Status Mapping
// ═══════════════════════════════════════════════════════════════

const STATUS_MAP: Record<VagaroAppointment["status"], UnifiedAppointment["status"]> = {
  Confirmed: "confirmed",
  Pending: "pending",
  Completed: "completed",
  NoShow: "no_show",
  Cancelled: "cancelled",
  Rescheduled: "rescheduled",
};

// ═══════════════════════════════════════════════════════════════
// Normalization
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize a raw VagaroAppointment into a UnifiedAppointment.
 */
export function normalizeVagaroAppointment(
  raw: VagaroAppointment,
  opts?: { sourceTimestamp?: string }
): UnifiedAppointment {
  const now = opts?.sourceTimestamp ?? new Date().toISOString();

  const mappedStatus = STATUS_MAP[raw.status] ?? "pending";

  return UnifiedAppointmentSchema.parse({
    id: crypto.randomUUID(),
    externalId: String(raw.id),
    customerId: String(raw.customerId),
    employeeId: String(raw.employeeId),
    serviceIds: (raw.serviceIds ?? raw.services?.map((s) => String(s.id)) ?? []).map(String),
    startTime: raw.startDateTime,
    endTime: raw.endDateTime,
    status: mappedStatus,
    notes: raw.notes ?? null,
    isRecurring: raw.isRecurring ?? false,
    isOnlineBooking: raw.isOnlineBooking ?? false,
    totalPrice: raw.totalPrice ?? null,
    totalDuration: raw.totalDuration ?? null,
    cancellationReason: raw.cancellationReason ?? null,
    source: "vagaro" as const,
    rawData: raw,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  });
}

// ═══════════════════════════════════════════════════════════════
// Data Access
// ═══════════════════════════════════════════════════════════════

export interface AppointmentSyncOptions {
  /** Start date (YYYY-MM-DD). Required. */
  startDate: string;
  /** End date (YYYY-MM-DD). Required. */
  endDate: string;
  /** Filter by specific customer */
  customerId?: string | number;
  /** Filter by specific employee */
  employeeId?: string | number;
  /** Filter by statuses */
  statuses?: VagaroAppointment["status"][];
  /** Only appointments updated since this ISO datetime */
  updatedSince?: string;
  /** Include deleted/cancelled appointments */
  includeDeleted?: boolean;
  pageSize?: number;
}

export interface AppointmentSyncResult {
  appointments: UnifiedAppointment[];
  totalFetched: number;
  totalNormalized: number;
  errors: Array<{ rawId?: string; error: VagaroError }>;
}

export class VagaroAppointmentsClient {
  private client: VagaroApiClient;

  constructor(config: { businessId: string; apiKey: string; baseUrl?: string }) {
    this.client = getVagaroClient({
      businessId: config.businessId,
      fetch: globalThis.fetch,
    });
  }

  /** Fetch a single appointment by Vagaro ID */
  async getById(vagaroAppointmentId: string | number): Promise<UnifiedAppointment> {
    const raw = await this.client.get<VagaroAppointment>(`/appointments/${vagaroAppointmentId}`);
    const validated = VagaroAppointmentSchema.parse(raw);
    return normalizeVagaroAppointment(validated);
  }

  /** Fetch appointments within a date range */
  async list(options: AppointmentSyncOptions): Promise<AppointmentSyncResult> {
    const params: VagaroAppointmentListParams = {
      page: 1,
      pageSize: options.pageSize ?? 100,
      startDate: options.startDate,
      endDate: options.endDate,
      customerId: options.customerId ? String(options.customerId) : undefined,
      employeeId: options.employeeId ? String(options.employeeId) : undefined,
      status: options.statuses,
      updatedSince: options.updatedSince,
      includeDeleted: options.includeDeleted ?? false,
    };

    const result: AppointmentSyncResult = {
      appointments: [],
      totalFetched: 0,
      totalNormalized: 0,
      errors: [],
    };

    for await (const raw of this.client.paginate<VagaroAppointment>("/appointments", params)) {
      result.totalFetched++;
      try {
        const validated = VagaroAppointmentSchema.parse(raw);
        const normalized = normalizeVagaroAppointment(validated);
        result.appointments.push(normalized);
        result.totalNormalized++;
      } catch (err) {
        const error = err instanceof VagaroError
          ? err
          : new VagaroError({
              code: VagaroErrorCodeSchema.enum.VALIDATION_ERROR,
              message: err instanceof Error ? err.message : String(err),
              retryable: false,
            });
        result.errors.push({ rawId: String((raw as Record<string, unknown>)?.id ?? "unknown"), error });
      }
    }

    return result;
  }

  /** Fetch appointments for today */
  async getToday(): Promise<AppointmentSyncResult> {
    const today = new Date().toISOString().slice(0, 10);
    return this.list({ startDate: today, endDate: today });
  }

  /** Fetch appointments for a specific date */
  async getByDate(date: string): Promise<AppointmentSyncResult> {
    return this.list({ startDate: date, endDate: date });
  }

  /** Fetch appointments for a date range */
  async getByDateRange(startDate: string, endDate: string): Promise<AppointmentSyncResult> {
    return this.list({ startDate, endDate });
  }

  /** Incremental sync — appointments updated since a timestamp */
  async syncSince(updatedSince: string, options?: Omit<AppointmentSyncOptions, "updatedSince">): Promise<AppointmentSyncResult> {
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
    return this.list({
      startDate: thirtyDaysAgo,
      endDate: today,
      ...options,
      updatedSince,
    });
  }

  /** Full sync — all appointments in a date window (default: last 90 days + next 90 days) */
  async fullSync(options?: { startDate?: string; endDate?: string; pageSize?: number }): Promise<AppointmentSyncResult> {
    const now = new Date();
    const startDate =
      options?.startDate ?? new Date(now.getTime() - 90 * 86400_000).toISOString().slice(0, 10);
    const endDate =
      options?.endDate ?? new Date(now.getTime() + 90 * 86400_000).toISOString().slice(0, 10);

    return this.list({
      startDate,
      endDate,
      pageSize: options?.pageSize,
      includeDeleted: true,
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// Utility Export
// ═══════════════════════════════════════════════════════════════

export function createVagaroAppointmentsClient(config: {
  businessId: string;
  apiKey: string;
  baseUrl?: string;
}): VagaroAppointmentsClient {
  return new VagaroAppointmentsClient(config);
}

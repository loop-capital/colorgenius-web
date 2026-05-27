/**
 * Phorest Appointments Sync Module
 * Fetches bookings and maps them to UnifiedAppointment.
 */

import {
  type PhorestAppointment,
  type UnifiedAppointment,
  type PhorestAppointmentListParams,
  PhorestAppointmentSchema,
  PhorestAppointmentStatusSchema,
  UnifiedAppointmentSchema,
  PhorestError,
  PhorestErrorCodeSchema,
} from "./types";
import { PhorestApiClient, getPhorestClient } from "./phorest-client";
import type { PhorestService } from "./types";

// ═══════════════════════════════════════════════════════════════
// Status Mapping
// ═══════════════════════════════════════════════════════════════

const STATUS_MAP: Record<PhorestAppointment["status"], UnifiedAppointment["status"]> = {
  CONFIRMED: "confirmed",
  PENDING: "pending",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
  CANCELLED: "cancelled",
  CHECKED_IN: "checked_in",
  ARRIVED: "arrived",
  IN_PROGRESS: "in_progress",
  DELETED: "deleted",
};

// ═══════════════════════════════════════════════════════════════
// Normalization
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize a raw PhorestAppointment into a UnifiedAppointment.
 */
export function normalizePhorestAppointment(
  raw: PhorestAppointment,
  opts?: { sourceTimestamp?: string }
): UnifiedAppointment {
  const now = opts?.sourceTimestamp ?? new Date().toISOString();

  const mappedStatus = STATUS_MAP[raw.status] ?? "pending";

  return UnifiedAppointmentSchema.parse({
    id: crypto.randomUUID(),
    externalId: String(raw.id),
    customerId: String(raw.clientId),
    employeeId: raw.staffId ? String(raw.staffId) : null,
    serviceIds: (raw.serviceIds ?? raw.services?.map((s: PhorestService) => String(s.id)) ?? []).map(String),
    startTime: raw.startDateTime,
    endTime: raw.endDateTime,
    duration: raw.duration ?? null,
    status: mappedStatus,
    notes: raw.notes ?? null,
    isRecurring: raw.isRecurring ?? false,
    isOnlineBooking: raw.isOnlineBooking ?? false,
    totalPrice: raw.totalPrice ?? null,
    totalDuration: raw.totalDuration ?? null,
    cancellationReason: raw.cancellationReason ?? null,
    roomId: raw.roomId ? String(raw.roomId) : null,
    branchId: String(raw.branchId),
    source: "phorest" as const,
    rawData: raw,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  });
}

// ═══════════════════════════════════════════════════════════════
// Data Access
// ═══════════════════════════════════════════════════════════════

export interface AppointmentSyncOptions {
  /** Branch ID (required for appointments) */
  branchId: string;
  /** Date filter (YYYY-MM-DD) */
  date?: string;
  /** Filter by specific customer */
  clientId?: string;
  /** Filter by specific staff */
  staffId?: string;
  /** Filter by specific room */
  roomId?: string;
  /** Filter by statuses */
  statuses?: PhorestAppointment["status"][];
  /** Only appointments updated since this ISO datetime */
  updatedSince?: string;
  /** Include cancelled appointments */
  includeCanceled?: boolean;
  /** Include deleted appointments */
  includeDeleted?: boolean;
  /** Include archived appointments */
  includeArchived?: boolean;
  pageSize?: number;
}

export interface AppointmentSyncResult {
  appointments: UnifiedAppointment[];
  totalFetched: number;
  totalNormalized: number;
  errors: Array<{ rawId?: string; error: PhorestError }>;
}

export class PhorestAppointmentsClient {
  private client: PhorestApiClient;
  private businessId: string;

  constructor(config: { businessId: string; baseUrl?: string }) {
    this.businessId = config.businessId;
    this.client = getPhorestClient({
      businessId: config.businessId,
      fetch: globalThis.fetch,
    });
  }

  /** Fetch a single appointment by Phorest ID */
  async getById(branchId: string, phorestAppointmentId: string): Promise<UnifiedAppointment> {
    const raw = await this.client.get<PhorestAppointment>(
      `/business/${this.businessId}/branch/${branchId}/appointment/${phorestAppointmentId}`
    );
    const validated = PhorestAppointmentSchema.parse(raw);
    return normalizePhorestAppointment(validated);
  }

  /** Fetch appointments with optional filtering */
  async list(options: AppointmentSyncOptions): Promise<AppointmentSyncResult> {
    const params: PhorestAppointmentListParams = {
      page: 0,
      size: options.pageSize ?? 100,
      date: options.date,
      updated_at: options.updatedSince,
      staff_id: options.staffId,
      room_id: options.roomId,
      client_id: options.clientId,
      include_canceled: options.includeCanceled ?? false,
      include_deleted: options.includeDeleted ?? false,
      include_archived: options.includeArchived ?? false,
    };

    const result: AppointmentSyncResult = {
      appointments: [],
      totalFetched: 0,
      totalNormalized: 0,
      errors: [],
    };

    for await (const raw of this.client.paginate<PhorestAppointment>(
      `/business/${this.businessId}/branch/${options.branchId}/appointment`,
      params
    )) {
      result.totalFetched++;
      try {
        const validated = PhorestAppointmentSchema.parse(raw);
        const normalized = normalizePhorestAppointment(validated);
        result.appointments.push(normalized);
        result.totalNormalized++;
      } catch (err) {
        const error = err instanceof PhorestError
          ? err
          : new PhorestError({
              code: PhorestErrorCodeSchema.enum.VALIDATION_ERROR,
              message: err instanceof Error ? err.message : String(err),
              retryable: false,
            });
        result.errors.push({ rawId: String((raw as Record<string, unknown>)?.id ?? "unknown"), error });
      }
    }

    return result;
  }

  /** Update an appointment */
  async update(
    branchId: string,
    phorestAppointmentId: string,
    data: Partial<{
      startDateTime: string;
      endDateTime: string;
      status: PhorestAppointment["status"];
      notes: string;
      staffId: string;
      serviceIds: string[];
    }>
  ): Promise<UnifiedAppointment> {
    const raw = await this.client.put<PhorestAppointment>(
      `/business/${this.businessId}/branch/${branchId}/appointment/${phorestAppointmentId}`,
      data
    );
    const validated = PhorestAppointmentSchema.parse(raw);
    return normalizePhorestAppointment(validated);
  }

  /** Check in a client for an appointment */
  async checkIn(branchId: string, phorestAppointmentId: string): Promise<UnifiedAppointment> {
    const raw = await this.client.post<PhorestAppointment>(
      `/business/${this.businessId}/branch/${branchId}/appointment/check-in`,
      { appointmentId: phorestAppointmentId }
    );
    const validated = PhorestAppointmentSchema.parse(raw);
    return normalizePhorestAppointment(validated);
  }

  /** Fetch appointments for today */
  async getToday(branchId: string): Promise<AppointmentSyncResult> {
    const today = new Date().toISOString().slice(0, 10);
    return this.list({ branchId, date: today });
  }

  /** Fetch appointments for a specific date */
  async getByDate(branchId: string, date: string): Promise<AppointmentSyncResult> {
    return this.list({ branchId, date });
  }

  /** Fetch appointments for a date range */
  async getByDateRange(branchId: string, startDate: string, endDate: string): Promise<AppointmentSyncResult> {
    // Phorest appointments are limited to 1 month range per request
    // We'll need to chunk if the range is longer, but for simplicity we return one month
    const results: AppointmentSyncResult = {
      appointments: [],
      totalFetched: 0,
      totalNormalized: 0,
      errors: [],
    };

    const start = new Date(startDate);
    const end = new Date(endDate);
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    let current = new Date(start);
    while (current <= end) {
      const chunkEnd = new Date(Math.min(current.getTime() + oneMonth, end.getTime()));
      const chunk = await this.list({
        branchId,
        date: current.toISOString().slice(0, 10),
      });

      results.appointments.push(...chunk.appointments);
      results.totalFetched += chunk.totalFetched;
      results.totalNormalized += chunk.totalNormalized;
      results.errors.push(...chunk.errors);

      current = new Date(chunkEnd.getTime() + 24 * 60 * 60 * 1000);
    }

    return results;
  }

  /** Incremental sync — appointments updated since a timestamp */
  async syncSince(branchId: string, updatedSince: string, options?: Omit<AppointmentSyncOptions, "branchId" | "updatedSince">): Promise<AppointmentSyncResult> {
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
    return this.list({
      branchId,
      date: thirtyDaysAgo,
      ...options,
      updatedSince,
    });
  }

  /** Full sync — all appointments in a date window (default: last 90 days + next 90 days) */
  async fullSync(branchId: string, options?: { startDate?: string; endDate?: string; pageSize?: number }): Promise<AppointmentSyncResult> {
    const now = new Date();
    const startDate =
      options?.startDate ?? new Date(now.getTime() - 90 * 86400_000).toISOString().slice(0, 10);
    const endDate =
      options?.endDate ?? new Date(now.getTime() + 90 * 86400_000).toISOString().slice(0, 10);

    return this.getByDateRange(branchId, startDate, endDate);
  }
}

// ═══════════════════════════════════════════════════════════════
// Utility Export
// ═══════════════════════════════════════════════════════════════

export function createPhorestAppointmentsClient(config: {
  businessId: string;
  baseUrl?: string;
}): PhorestAppointmentsClient {
  return new PhorestAppointmentsClient(config);
}

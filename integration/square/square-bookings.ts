/**
 * Square Bookings Sync Module
 * Fetch appointments and map to UnifiedAppointment
 */

import { z } from 'zod';
import { SquareClient, SquareError } from './square-client';
import {
  type SquareBooking,
  type UnifiedAppointment,
} from './types';

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const catalogObjectReferenceSchema = z.object({
  object_id: z.string().optional(),
  catalog_version: z.number().optional(),
});

const appointmentSegmentSchema = z.object({
  duration_minutes: z.number(),
  service_variation: catalogObjectReferenceSchema.optional(),
  team_member_id: z.string().optional(),
  service_variation_version: z.number().optional(),
  intermission_duration_minutes: z.number().optional(),
  any_team_member: z.boolean().optional(),
});

const bookingCreatorDetailsSchema = z.object({
  creator_type: z.enum(['TEAM_MEMBER', 'CUSTOMER']),
  team_member_id: z.string().optional(),
  customer_id: z.string().optional(),
});

const squareBookingSchema = z.object({
  id: z.string(),
  version: z.number(),
  status: z.enum(['ACCEPTED', 'PENDING', 'DECLINED', 'DEPARTED', 'CANCELLED', 'NO_SHOW']),
  created_at: z.string(),
  updated_at: z.string(),
  start_at: z.string(),
  location_id: z.string(),
  customer_id: z.string().optional(),
  customer_note: z.string().optional(),
  seller_note: z.string().optional(),
  appointment_segments: z.array(appointmentSegmentSchema),
  transition_time_minutes: z.number().optional(),
  creator_details: bookingCreatorDetailsSchema.optional(),
  source: z.string().optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// Status mapping
// ---------------------------------------------------------------------------

function mapBookingStatus(status: SquareBooking['status']): UnifiedAppointment['status'] {
  switch (status) {
    case 'ACCEPTED':
      return 'confirmed';
    case 'PENDING':
      return 'pending';
    case 'DECLINED':
      return 'declined';
    case 'CANCELLED':
      return 'cancelled';
    case 'DEPARTED':
      return 'completed';
    case 'NO_SHOW':
      return 'no_show';
    default:
      return 'pending';
  }
}

// ---------------------------------------------------------------------------
// SquareBookings class
// ---------------------------------------------------------------------------

export class SquareBookings {
  private readonly client: SquareClient;

  constructor(client: SquareClient) {
    this.client = client;
  }

  // -----------------------------------------------------------------------
  // Fetch
  // -----------------------------------------------------------------------

  /**
   * Fetch a single booking by ID
   */
  async getBooking(merchantId: string, bookingId: string): Promise<UnifiedAppointment | null> {
    try {
      const response = await this.client.get<{ booking?: unknown }>(
        merchantId,
        `/bookings/${bookingId}`,
      );

      if (!response.booking) return null;

      const validated = squareBookingSchema.safeParse(response.booking);
      if (!validated.success) {
        throw new BookingSyncError(
          'VALIDATION_FAILED',
          `Booking ${bookingId} failed validation: ${validated.error.message}`,
        );
      }

      return this.normalizeBooking(validated.data, merchantId);
    } catch (error) {
      if (error instanceof SquareError && error.code === 'NOT_FOUND') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Fetch all bookings for a merchant
   */
  async getAllBookings(
    merchantId: string,
    options: {
      startAtMin?: Date;
      startAtMax?: Date;
      locationId?: string;
      customerId?: string;
      teamMemberId?: string;
      status?: SquareBooking['status'];
      cursor?: string;
      limit?: number;
    } = {},
  ): Promise<{ appointments: UnifiedAppointment[]; cursor?: string }> {
    const query: Record<string, string | number | undefined> = {
      limit: options.limit ?? 100,
    };

    if (options.startAtMin) {
      query.start_at_min = options.startAtMin.toISOString();
    }
    if (options.startAtMax) {
      query.start_at_max = options.startAtMax.toISOString();
    }
    if (options.locationId) {
      query.location_id = options.locationId;
    }
    if (options.customerId) {
      query.customer_id = options.customerId;
    }
    if (options.teamMemberId) {
      query.team_member_id = options.teamMemberId;
    }
    if (options.status) {
      query.status = options.status;
    }
    if (options.cursor) {
      query.cursor = options.cursor;
    }

    const response = await this.client.get<{
      bookings?: unknown[];
      cursor?: string;
      errors?: unknown[];
    }>(merchantId, '/bookings', query);

    if (response.errors?.length) {
      throw new BookingSyncError(
        'FETCH_FAILED',
        `Bookings fetch failed: ${JSON.stringify(response.errors)}`,
      );
    }

    const appointments: UnifiedAppointment[] = [];
    for (const raw of response.bookings ?? []) {
      const validated = squareBookingSchema.safeParse(raw);
      if (!validated.success) {
        console.warn(`Booking validation failed, skipping: ${validated.error.message}`);
        continue;
      }
      appointments.push(this.normalizeBooking(validated.data, merchantId));
    }

    return { appointments, cursor: response.cursor };
  }

  /**
   * Fetch all bookings with auto-pagination
   */
  async getAllBookingsPaginated(
    merchantId: string,
    options: {
      startAtMin?: Date;
      startAtMax?: Date;
      locationId?: string;
      customerId?: string;
      teamMemberId?: string;
      status?: SquareBooking['status'];
      onProgress?: (processed: number) => void;
    } = {},
  ): Promise<UnifiedAppointment[]> {
    const results: UnifiedAppointment[] = [];
    let cursor: string | undefined;

    do {
      const page = await this.getAllBookings(merchantId, {
        ...options,
        cursor,
        limit: 100,
      });

      results.push(...page.appointments);
      cursor = page.cursor;

      options.onProgress?.(results.length);
    } while (cursor);

    return results;
  }

  /**
   * Fetch upcoming bookings (start_at >= now)
   */
  async getUpcomingBookings(
    merchantId: string,
    options: {
      locationId?: string;
      customerId?: string;
      limit?: number;
    } = {},
  ): Promise<UnifiedAppointment[]> {
    return this.getAllBookingsPaginated(merchantId, {
      startAtMin: new Date(),
      ...options,
    });
  }

  /**
   * Fetch bookings for a specific date range
   */
  async getBookingsForDateRange(
    merchantId: string,
    startDate: Date,
    endDate: Date,
    options: {
      locationId?: string;
      teamMemberId?: string;
    } = {},
  ): Promise<UnifiedAppointment[]> {
    return this.getAllBookingsPaginated(merchantId, {
      startAtMin: startDate,
      startAtMax: endDate,
      ...options,
    });
  }

  /**
   * Fetch bookings by customer
   */
  async getBookingsByCustomer(
    merchantId: string,
    customerId: string,
    options: {
      upcomingOnly?: boolean;
      limit?: number;
    } = {},
  ): Promise<UnifiedAppointment[]> {
    return this.getAllBookingsPaginated(merchantId, {
      customerId,
      startAtMin: options.upcomingOnly ? new Date() : undefined,
    });
  }

  // -----------------------------------------------------------------------
  // Create / Update / Cancel
  // -----------------------------------------------------------------------

  /**
   * Create a booking in Square
   */
  async createBooking(
    merchantId: string,
    booking: {
      locationId: string;
      customerId: string;
      serviceVariationId: string;
      serviceVariationVersion?: number;
      teamMemberId?: string;
      startAt: Date;
      customerNote?: string;
      sellerNote?: string;
      appointmentSegments?: Array<{
        durationMinutes: number;
        serviceVariationId?: string;
        teamMemberId?: string;
      }>;
    },
  ): Promise<UnifiedAppointment> {
    const body: Record<string, unknown> = {
      booking: {
        location_id: booking.locationId,
        customer_id: booking.customerId,
        start_at: booking.startAt.toISOString(),
        appointment_segments: booking.appointmentSegments?.map((seg) => ({
          duration_minutes: seg.durationMinutes,
          service_variation: seg.serviceVariationId
            ? { object_id: seg.serviceVariationId }
            : undefined,
          team_member_id: seg.teamMemberId,
        })) ?? [{
          duration_minutes: 60, // default fallback
          service_variation: { object_id: booking.serviceVariationId },
          team_member_id: booking.teamMemberId,
        }],
      },
    };

    if (booking.customerNote) {
      (body.booking as Record<string, unknown>).customer_note = booking.customerNote;
    }
    if (booking.sellerNote) {
      (body.booking as Record<string, unknown>).seller_note = booking.sellerNote;
    }

    const response = await this.client.post<{ booking?: unknown }>(
      merchantId,
      '/bookings',
      body,
    );

    if (!response.booking) {
      throw new BookingSyncError(
        'CREATE_FAILED',
        'Square returned no booking data on create',
      );
    }

    const validated = squareBookingSchema.parse(response.booking);
    return this.normalizeBooking(validated, merchantId);
  }

  /**
   * Update a booking in Square
   */
  async updateBooking(
    merchantId: string,
    bookingId: string,
    updates: {
      startAt?: Date;
      customerNote?: string;
      sellerNote?: string;
      appointmentSegments?: Array<{
        durationMinutes: number;
        serviceVariationId?: string;
        teamMemberId?: string;
      }>;
    },
  ): Promise<UnifiedAppointment> {
    const body: Record<string, unknown> = {
      booking: {},
    };

    if (updates.startAt) {
      (body.booking as Record<string, unknown>).start_at = updates.startAt.toISOString();
    }
    if (updates.customerNote !== undefined) {
      (body.booking as Record<string, unknown>).customer_note = updates.customerNote;
    }
    if (updates.sellerNote !== undefined) {
      (body.booking as Record<string, unknown>).seller_note = updates.sellerNote;
    }
    if (updates.appointmentSegments) {
      (body.booking as Record<string, unknown>).appointment_segments =
        updates.appointmentSegments.map((seg) => ({
          duration_minutes: seg.durationMinutes,
          service_variation: seg.serviceVariationId
            ? { object_id: seg.serviceVariationId }
            : undefined,
          team_member_id: seg.teamMemberId,
        }));
    }

    const response = await this.client.put<{ booking?: unknown }>(
      merchantId,
      `/bookings/${bookingId}`,
      body,
    );

    if (!response.booking) {
      throw new BookingSyncError(
        'UPDATE_FAILED',
        'Square returned no booking data on update',
      );
    }

    const validated = squareBookingSchema.parse(response.booking);
    return this.normalizeBooking(validated, merchantId);
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    merchantId: string,
    bookingId: string,
    reason?: string,
  ): Promise<UnifiedAppointment> {
    const body: Record<string, unknown> = {};
    if (reason) body.cancellation_reason = reason;

    const response = await this.client.post<{ booking?: unknown }>(
      merchantId,
      `/bookings/${bookingId}/cancel`,
      body,
    );

    if (!response.booking) {
      throw new BookingSyncError(
        'CANCEL_FAILED',
        'Square returned no booking data on cancel',
      );
    }

    const validated = squareBookingSchema.parse(response.booking);
    return this.normalizeBooking(validated, merchantId);
  }

  // -----------------------------------------------------------------------
  // Normalization
  // -----------------------------------------------------------------------

  private normalizeBooking(booking: SquareBooking, merchantId: string): UnifiedAppointment {
    // Compute end time from appointment segments
    const totalDuration = booking.appointment_segments.reduce(
      (sum, seg) => sum + seg.duration_minutes + (seg.intermission_duration_minutes ?? 0),
      0,
    );

    const startAt = new Date(booking.start_at);
    const endAt = new Date(startAt.getTime() + totalDuration * 60_000);

    // Primary service name from first segment
    const primarySegment = booking.appointment_segments[0];
    const serviceVariationId = primarySegment?.service_variation?.object_id;

    // Creator details
    const staffId =
      booking.creator_details?.team_member_id ??
      primarySegment?.team_member_id;

    return {
      id: `sq_${booking.id}`,
      externalId: booking.id,
      platform: 'square',
      merchantId,
      customerId: booking.customer_id,
      locationId: booking.location_id,
      status: mapBookingStatus(booking.status),
      startAt: booking.start_at,
      endAt: endAt.toISOString(),
      serviceName: serviceVariationId, // Will be enriched by caller with catalog lookup
      serviceVariationId,
      staffId,
      staffName: undefined, // Enriched by caller
      customerNote: booking.customer_note,
      sellerNote: booking.seller_note,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      rawData: booking as unknown as Record<string, unknown>,
    };
  }
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class BookingSyncError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'BookingSyncError';
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BookingSyncError);
    }
  }
}

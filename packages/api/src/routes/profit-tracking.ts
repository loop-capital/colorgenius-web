import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../db/index.js';
import { authenticate } from '../auth/jwt.js';
import type { ApiResponse } from '../types/index.js';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ProfitTrackingQuery {
  startDate?: string;
  endDate?: string;
  staffId?: string;
  formulaId?: string;
  productId?: string;
  groupBy?: 'day' | 'week' | 'month' | 'staff' | 'formula' | 'product';
}

interface ProductUsage {
  productId: string;
  productName: string;
  brand: string;
  sku: string;
  category: string;
  amountGrams: number;
  unitCostCentsAtUse: number | null;
  actualCostCents: number;
}

interface FormulaUsageDetail {
  formulaId: string;
  formulaName: string;
  clientName: string;
  usedAt: string;
  staffId: string;
  staffName: string;
  products: ProductUsage[];
  totalActualCostCents: number;
  totalEstimatedCostCents: number;
  costVarianceCents: number;
  costVariancePercent: number;
}

interface ProfitSummaryMetrics {
  totalServices: number;
  totalActualCostCents: number;
  totalEstimatedCostCents: number;
  totalVarianceCents: number;
  averageVariancePercent: number;
  overBudgetCount: number;
  underBudgetCount: number;
  onBudgetCount: number;
}

interface ProfitTrackingResponse {
  metrics: ProfitSummaryMetrics;
  details: FormulaUsageDetail[];
  groupedData?: Record<string, unknown>[];
}

interface GroupedProfitRow {
  group_key: string;
  group_label: string;
  service_count: number;
  total_actual_cost_cents: number;
  total_estimated_cost_cents: number;
  avg_variance_percent: number;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// ─────────────────────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────────────────────

export async function profitTrackingRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /profit-tracking
  fastify.get<{
    Querystring: ProfitTrackingQuery;
    Reply: ApiResponse<ProfitTrackingResponse>;
  }>(
    '/profit-tracking',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
      }

      const { startDate, endDate, staffId, formulaId, productId, groupBy } = request.query;

      // Validate date range
      const effectiveStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const effectiveEndDate = endDate ? new Date(endDate) : new Date();

      if (Number.isNaN(effectiveStartDate.getTime()) || Number.isNaN(effectiveEndDate.getTime())) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid date format. Use ISO 8601 (YYYY-MM-DD).' },
        });
      }

      try {
        // ─────────────────────────────────────────────────────
        // 1. Fetch formula usage details with product breakdown
        // ─────────────────────────────────────────────────────

        const detailQuery = `
          SELECT
            cfu.id as usage_id,
            cfu.formula_id,
            cfu.client_name,
            cfu.used_at,
            cfu.staff_id,
            s.name as staff_name,
            f.name as formula_name,
            f.id as formula_ref_id,
            -- Product usage from usage_logs
            ul.id as usage_log_id,
            ul.product_id,
            ul.amount_grams,
            ul.unit_cost_cents_at_use,
            p.name as product_name,
            p.brand as product_brand,
            p.sku as product_sku,
            p.category as product_category,
            p.unit_cost_cents as current_unit_cost
          FROM client_formula_usages cfu
          JOIN formulas f ON f.id = cfu.formula_id
          LEFT JOIN staff s ON s.id = cfu.staff_id
          LEFT JOIN usage_logs ul ON ul.formula_id = cfu.formula_id
            AND ul.used_at BETWEEN cfu.used_at - INTERVAL '1 hour' AND cfu.used_at + INTERVAL '1 hour'
            AND ul.client_id = cfu.client_id
          LEFT JOIN products p ON p.id = ul.product_id
          WHERE cfu.used_at BETWEEN $1 AND $2
            AND ($3::text IS NULL OR cfu.staff_id = $3)
            AND ($4::text IS NULL OR cfu.formula_id = $4)
            AND ($5::text IS NULL OR ul.product_id = $5)
          ORDER BY cfu.used_at DESC
        `;

        const detailResult = await query(detailQuery, [
          effectiveStartDate.toISOString(),
          effectiveEndDate.toISOString(),
          staffId || null,
          formulaId || null,
          productId || null,
        ]);

        // ─────────────────────────────────────────────────────
        // 2. Build formula usage details with cost calculations
        // ─────────────────────────────────────────────────────

        const formulaMap = new Map<string, FormulaUsageDetail>();

        for (const row of detailResult.rows) {
          const usageId = String(row.usage_id);

          if (!formulaMap.has(usageId)) {
            formulaMap.set(usageId, {
              formulaId: String(row.formula_id),
              formulaName: String(row.formula_name || 'Unnamed Formula'),
              clientName: String(row.client_name || 'Unknown Client'),
              usedAt: new Date(row.used_at as string).toISOString(),
              staffId: String(row.staff_id || ''),
              staffName: String(row.staff_name || 'Unknown'),
              products: [],
              totalActualCostCents: 0,
              totalEstimatedCostCents: 0,
              costVarianceCents: 0,
              costVariancePercent: 0,
            });
          }

          const detail = formulaMap.get(usageId)!;

          // Add product if usage log exists
          if (row.usage_log_id) {
            const amountGrams = safeNumber(row.amount_grams);
            const unitCostCents = safeNumber(
              row.unit_cost_cents_at_use ?? row.current_unit_cost ?? 0
            );
            // Cost per gram = unit cost / sizeGrams (default 60g tube)
            const sizeGrams = 60; // Standard tube size
            const actualCostCents = Math.round((amountGrams / sizeGrams) * unitCostCents);

            const product: ProductUsage = {
              productId: String(row.product_id),
              productName: String(row.product_name || 'Unknown Product'),
              brand: String(row.product_brand || ''),
              sku: String(row.product_sku || ''),
              category: String(row.product_category || 'COLOR'),
              amountGrams,
              unitCostCentsAtUse: unitCostCents,
              actualCostCents,
            };

            detail.products.push(product);
            detail.totalActualCostCents += actualCostCents;
          }
        }

        // ─────────────────────────────────────────────────────
        // 3. Calculate estimated costs from formula_lines
        // ─────────────────────────────────────────────────────

        const formulaIds = Array.from(new Set(
          detailResult.rows
            .filter((r) => r.formula_ref_id)
            .map((r) => String(r.formula_ref_id))
        ));

        let estimatedCostsMap = new Map<string, number>();

        if (formulaIds.length > 0) {
          const placeholders = formulaIds.map((_, i) => `$${i + 1}`).join(',');
          const estimateQuery = `
            SELECT
              fl.formula_id,
              SUM(
                ROUND(
                  (fl.amount_grams::numeric / COALESCE(p.size_grams, 60)) *
                  COALESCE(p.unit_cost_cents, 0)
                )
              ) as estimated_cost_cents
            FROM formula_lines fl
            JOIN products p ON p.id = fl.product_id
            WHERE fl.formula_id IN (${placeholders})
            GROUP BY fl.formula_id
          `;

          const estimateResult = await query(estimateQuery, formulaIds);

          for (const row of estimateResult.rows) {
            estimatedCostsMap.set(
              String(row.formula_id),
              safeNumber(row.estimated_cost_cents)
            );
          }
        }

        // Apply estimated costs and compute variances
        const details: FormulaUsageDetail[] = [];
        for (const detail of formulaMap.values()) {
          const estimatedCost = estimatedCostsMap.get(detail.formulaId) || 0;
          detail.totalEstimatedCostCents = estimatedCost;
          detail.costVarianceCents = detail.totalActualCostCents - estimatedCost;
          detail.costVariancePercent = estimatedCost > 0
            ? Math.round((detail.costVarianceCents / estimatedCost) * 10000) / 100
            : 0;
          details.push(detail);
        }

        // ─────────────────────────────────────────────────────
        // 4. Compute summary metrics
        // ─────────────────────────────────────────────────────

        const metrics: ProfitSummaryMetrics = {
          totalServices: details.length,
          totalActualCostCents: details.reduce((sum, d) => sum + d.totalActualCostCents, 0),
          totalEstimatedCostCents: details.reduce((sum, d) => sum + d.totalEstimatedCostCents, 0),
          totalVarianceCents: details.reduce((sum, d) => sum + d.costVarianceCents, 0),
          averageVariancePercent: details.length > 0
            ? Math.round(details.reduce((sum, d) => sum + d.costVariancePercent, 0) / details.length * 100) / 100
            : 0,
          overBudgetCount: details.filter((d) => d.costVarianceCents > 0).length,
          underBudgetCount: details.filter((d) => d.costVarianceCents < 0).length,
          onBudgetCount: details.filter((d) => d.costVarianceCents === 0).length,
        };

        // ─────────────────────────────────────────────────────
        // 5. Grouped data (optional)
        // ─────────────────────────────────────────────────────

        let groupedData: Record<string, unknown>[] | undefined;

        if (groupBy) {
          const groupSql = buildGroupByQuery(groupBy);
          const groupResult = await query(groupSql, [
            effectiveStartDate.toISOString(),
            effectiveEndDate.toISOString(),
            staffId || null,
            formulaId || null,
          ]);

          groupedData = groupResult.rows.map((row: Record<string, unknown>) => ({
            key: String(row.group_key),
            label: String(row.group_label),
            serviceCount: safeNumber(row.service_count),
            totalActualCostDollars: centsToDollars(safeNumber(row.total_actual_cost_cents)),
            totalEstimatedCostDollars: centsToDollars(safeNumber(row.total_estimated_cost_cents)),
            varianceDollars: centsToDollars(
              safeNumber(row.total_actual_cost_cents) - safeNumber(row.total_estimated_cost_cents)
            ),
            variancePercent: Math.round(safeNumber(row.avg_variance_percent) * 100) / 100,
          }));
        }

        // ─────────────────────────────────────────────────────
        // 6. Response
        // ─────────────────────────────────────────────────────

        const response: ProfitTrackingResponse = {
          metrics: {
            ...metrics,
            totalActualCostDollars: centsToDollars(metrics.totalActualCostCents),
            totalEstimatedCostDollars: centsToDollars(metrics.totalEstimatedCostCents),
            totalVarianceDollars: centsToDollars(metrics.totalVarianceCents),
          } as unknown as ProfitSummaryMetrics,
          details: details.map((d) => ({
            ...d,
            totalActualCostDollars: centsToDollars(d.totalActualCostCents),
            totalEstimatedCostDollars: centsToDollars(d.totalEstimatedCostCents),
            costVarianceDollars: centsToDollars(d.costVarianceCents),
            products: d.products.map((p) => ({
              ...p,
              actualCostDollars: centsToDollars(p.actualCostCents),
              unitCostDollarsAtUse: p.unitCostCentsAtUse ? centsToDollars(p.unitCostCentsAtUse) : null,
            })),
          })),
          groupedData,
        };

        return reply.status(200).send({
          success: true,
          data: response,
        });
      } catch (error) {
        fastify.log.error(
          'Profit tracking error: %s',
          error instanceof Error ? error.message : String(error)
        );
        return reply.status(500).send({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to fetch profit tracking data' },
        });
      }
    }
  );
}

// ─────────────────────────────────────────────────────────────
// Group-by query builder
// ─────────────────────────────────────────────────────────────

function buildGroupByQuery(groupBy: string): string {
  const dateTrunc = {
    day: 'day',
    week: 'week',
    month: 'month',
  };

  switch (groupBy) {
    case 'day':
      return `
        SELECT
          DATE_TRUNC('day', cfu.used_at)::text as group_key,
          TO_CHAR(DATE_TRUNC('day', cfu.used_at), 'YYYY-MM-DD') as group_label,
          COUNT(DISTINCT cfu.id) as service_count,
          COALESCE(SUM(actual.actual_cost_cents), 0) as total_actual_cost_cents,
          COALESCE(SUM(estimated.estimated_cost_cents), 0) as total_estimated_cost_cents,
          CASE
            WHEN COALESCE(SUM(estimated.estimated_cost_cents), 0) > 0
            THEN ROUND((COALESCE(SUM(actual.actual_cost_cents), 0) - COALESCE(SUM(estimated.estimated_cost_cents), 0)) / SUM(estimated.estimated_cost_cents) * 100, 2)
            ELSE 0
          END as avg_variance_percent
        FROM client_formula_usages cfu
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((ul.amount_grams::numeric / COALESCE(p.size_grams, 60)) * COALESCE(ul.unit_cost_cents_at_use, p.unit_cost_cents, 0))), 0) as actual_cost_cents
          FROM usage_logs ul
          JOIN products p ON p.id = ul.product_id
          WHERE ul.formula_id = cfu.formula_id
            AND ul.used_at BETWEEN cfu.used_at - INTERVAL '1 hour' AND cfu.used_at + INTERVAL '1 hour'
            AND ul.client_id = cfu.client_id
        ) actual ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((fl.amount_grams::numeric / COALESCE(p.size_grams, 60)) * COALESCE(p.unit_cost_cents, 0))), 0) as estimated_cost_cents
          FROM formula_lines fl
          JOIN products p ON p.id = fl.product_id
          WHERE fl.formula_id = cfu.formula_id
        ) estimated ON true
        WHERE cfu.used_at BETWEEN $1 AND $2
          AND ($3::text IS NULL OR cfu.staff_id = $3)
          AND ($4::text IS NULL OR cfu.formula_id = $4)
        GROUP BY DATE_TRUNC('day', cfu.used_at)
        ORDER BY group_key DESC
      `;

    case 'week':
      return `
        SELECT
          DATE_TRUNC('week', cfu.used_at)::text as group_key,
          'Week ' || TO_CHAR(DATE_TRUNC('week', cfu.used_at), 'IYYY-WW') as group_label,
          COUNT(DISTINCT cfu.id) as service_count,
          COALESCE(SUM(actual.actual_cost_cents), 0) as total_actual_cost_cents,
          COALESCE(SUM(estimated.estimated_cost_cents), 0) as total_estimated_cost_cents,
          CASE
            WHEN COALESCE(SUM(estimated.estimated_cost_cents), 0) > 0
            THEN ROUND((COALESCE(SUM(actual.actual_cost_cents), 0) - COALESCE(SUM(estimated.estimated_cost_cents), 0)) / SUM(estimated.estimated_cost_cents) * 100, 2)
            ELSE 0
          END as avg_variance_percent
        FROM client_formula_usages cfu
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((ul.amount_grams::numeric / COALESCE(p.size_grams, 60)) * COALESCE(ul.unit_cost_cents_at_use, p.unit_cost_cents, 0))), 0) as actual_cost_cents
          FROM usage_logs ul
          JOIN products p ON p.id = ul.product_id
          WHERE ul.formula_id = cfu.formula_id
            AND ul.used_at BETWEEN cfu.used_at - INTERVAL '1 hour' AND cfu.used_at + INTERVAL '1 hour'
            AND ul.client_id = cfu.client_id
        ) actual ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((fl.amount_grams::numeric / COALESCE(p.size_grams, 60)) * COALESCE(p.unit_cost_cents, 0))), 0) as estimated_cost_cents
          FROM formula_lines fl
          JOIN products p ON p.id = fl.product_id
          WHERE fl.formula_id = cfu.formula_id
        ) estimated ON true
        WHERE cfu.used_at BETWEEN $1 AND $2
          AND ($3::text IS NULL OR cfu.staff_id = $3)
          AND ($4::text IS NULL OR cfu.formula_id = $4)
        GROUP BY DATE_TRUNC('week', cfu.used_at)
        ORDER BY group_key DESC
      `;

    case 'month':
      return `
        SELECT
          DATE_TRUNC('month', cfu.used_at)::text as group_key,
          TO_CHAR(DATE_TRUNC('month', cfu.used_at), 'YYYY-MM') as group_label,
          COUNT(DISTINCT cfu.id) as service_count,
          COALESCE(SUM(actual.actual_cost_cents), 0) as total_actual_cost_cents,
          COALESCE(SUM(estimated.estimated_cost_cents), 0) as total_estimated_cost_cents,
          CASE
            WHEN COALESCE(SUM(estimated.estimated_cost_cents), 0) > 0
            THEN ROUND((COALESCE(SUM(actual.actual_cost_cents), 0) - COALESCE(SUM(estimated.estimated_cost_cents), 0)) / SUM(estimated.estimated_cost_cents) * 100, 2)
            ELSE 0
          END as avg_variance_percent
        FROM client_formula_usages cfu
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((ul.amount_grams::numeric / COALESCE(p.size_grams, 60)) * COALESCE(ul.unit_cost_cents_at_use, p.unit_cost_cents, 0))), 0) as actual_cost_cents
          FROM usage_logs ul
          JOIN products p ON p.id = ul.product_id
          WHERE ul.formula_id = cfu.formula_id
            AND ul.used_at BETWEEN cfu.used_at - INTERVAL '1 hour' AND cfu.used_at + INTERVAL '1 hour'
            AND ul.client_id = cfu.client_id
        ) actual ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((fl.amount_grams::numeric / COALESCE(p.size_grams, 60)) * COALESCE(p.unit_cost_cents, 0))), 0) as estimated_cost_cents
          FROM formula_lines fl
          JOIN products p ON p.id = fl.product_id
          WHERE fl.formula_id = cfu.formula_id
        ) estimated ON true
        WHERE cfu.used_at BETWEEN $1 AND $2
          AND ($3::text IS NULL OR cfu.staff_id = $3)
          AND ($4::text IS NULL OR cfu.formula_id = $4)
        GROUP BY DATE_TRUNC('month', cfu.used_at)
        ORDER BY group_key DESC
      `;

    case 'staff':
      return `
        SELECT
          COALESCE(cfu.staff_id, 'unknown') as group_key,
          COALESCE(s.name, 'Unknown Staff') as group_label,
          COUNT(DISTINCT cfu.id) as service_count,
          COALESCE(SUM(actual.actual_cost_cents), 0) as total_actual_cost_cents,
          COALESCE(SUM(estimated.estimated_cost_cents), 0) as total_estimated_cost_cents,
          CASE
            WHEN COALESCE(SUM(estimated.estimated_cost_cents), 0) > 0
            THEN ROUND((COALESCE(SUM(actual.actual_cost_cents), 0) - COALESCE(SUM(estimated.estimated_cost_cents), 0)) / SUM(estimated.estimated_cost_cents) * 100, 2)
            ELSE 0
          END as avg_variance_percent
        FROM client_formula_usages cfu
        LEFT JOIN staff s ON s.id = cfu.staff_id
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((ul.amount_grams::numeric / COALESCE(p.size_grams, 60)) * COALESCE(ul.unit_cost_cents_at_use, p.unit_cost_cents, 0))), 0) as actual_cost_cents
          FROM usage_logs ul
          JOIN products p ON p.id = ul.product_id
          WHERE ul.formula_id = cfu.formula_id
            AND ul.used_at BETWEEN cfu.used_at - INTERVAL '1 hour' AND cfu.used_at + INTERVAL '1 hour'
            AND ul.client_id = cfu.client_id
        ) actual ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((fl.amount_grams::numeric / COALESCE(p.size_grams, 60)) * COALESCE(p.unit_cost_cents, 0))), 0) as estimated_cost_cents
          FROM formula_lines fl
          JOIN products p ON p.id = fl.product_id
          WHERE fl.formula_id = cfu.formula_id
        ) estimated ON true
        WHERE cfu.used_at BETWEEN $1 AND $2
          AND ($3::text IS NULL OR cfu.staff_id = $3)
          AND ($4::text IS NULL OR cfu.formula_id = $4)
        GROUP BY cfu.staff_id, s.name
        ORDER BY total_actual_cost_cents DESC
      `;

    case 'formula':
      return `
        SELECT
          COALESCE(cfu.formula_id, 'unknown') as group_key,
          COALESCE(f.name, 'Unknown Formula') as group_label,
          COUNT(DISTINCT cfu.id) as service_count,
          COALESCE(SUM(actual.actual_cost_cents), 0) as total_actual_cost_cents,
          COALESCE(SUM(estimated.estimated_cost_cents), 0) as total_estimated_cost_cents,
          CASE
            WHEN COALESCE(SUM(estimated.estimated_cost_cents), 0) > 0
            THEN ROUND((COALESCE(SUM(actual.actual_cost_cents), 0) - COALESCE(SUM(estimated.estimated_cost_cents), 0)) / SUM(estimated.estimated_cost_cents) * 100, 2)
            ELSE 0
          END as avg_variance_percent
        FROM client_formula_usages cfu
        LEFT JOIN formulas f ON f.id = cfu.formula_id
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((ul.amount_grams::numeric / COALESCE(p.size_grams, 60)) * COALESCE(ul.unit_cost_cents_at_use, p.unit_cost_cents, 0))), 0) as actual_cost_cents
          FROM usage_logs ul
          JOIN products p ON p.id = ul.product_id
          WHERE ul.formula_id = cfu.formula_id
            AND ul.used_at BETWEEN cfu.used_at - INTERVAL '1 hour' AND cfu.used_at + INTERVAL '1 hour'
            AND ul.client_id = cfu.client_id
        ) actual ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((fl.amount_grams::numeric / COALESCE(p.size_grams, 60)) * COALESCE(p.unit_cost_cents, 0))), 0) as estimated_cost_cents
          FROM formula_lines fl
          JOIN products p ON p.id = fl.product_id
          WHERE fl.formula_id = cfu.formula_id
        ) estimated ON true
        WHERE cfu.used_at BETWEEN $1 AND $2
          AND ($3::text IS NULL OR cfu.staff_id = $3)
          AND ($4::text IS NULL OR cfu.formula_id = $4)
        GROUP BY cfu.formula_id, f.name
        ORDER BY total_actual_cost_cents DESC
      `;

    case 'product':
      return `
        SELECT
          COALESCE(p.id, 'unknown') as group_key,
          COALESCE(p.name || ' (' || p.brand || ')', 'Unknown Product') as group_label,
          COUNT(DISTINCT cfu.id) as service_count,
          COALESCE(SUM(ul_actual.actual_cost_cents), 0) as total_actual_cost_cents,
          COALESCE(SUM(fl_estimated.estimated_cost_cents), 0) as total_estimated_cost_cents,
          CASE
            WHEN COALESCE(SUM(fl_estimated.estimated_cost_cents), 0) > 0
            THEN ROUND((COALESCE(SUM(ul_actual.actual_cost_cents), 0) - COALESCE(SUM(fl_estimated.estimated_cost_cents), 0)) / SUM(fl_estimated.estimated_cost_cents) * 100, 2)
            ELSE 0
          END as avg_variance_percent
        FROM client_formula_usages cfu
        LEFT JOIN usage_logs ul ON ul.formula_id = cfu.formula_id
          AND ul.used_at BETWEEN cfu.used_at - INTERVAL '1 hour' AND cfu.used_at + INTERVAL '1 hour'
          AND ul.client_id = cfu.client_id
        LEFT JOIN products p ON p.id = ul.product_id
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((ul2.amount_grams::numeric / COALESCE(p2.size_grams, 60)) * COALESCE(ul2.unit_cost_cents_at_use, p2.unit_cost_cents, 0))), 0) as actual_cost_cents
          FROM usage_logs ul2
          JOIN products p2 ON p2.id = ul2.product_id
          WHERE ul2.id = ul.id
        ) ul_actual ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ROUND((fl.amount_grams::numeric / COALESCE(p2.size_grams, 60)) * COALESCE(p2.unit_cost_cents, 0))), 0) as estimated_cost_cents
          FROM formula_lines fl
          JOIN products p2 ON p2.id = fl.product_id
          WHERE fl.formula_id = cfu.formula_id
            AND fl.product_id = ul.product_id
        ) fl_estimated ON true
        WHERE cfu.used_at BETWEEN $1 AND $2
          AND ($3::text IS NULL OR cfu.staff_id = $3)
          AND ($4::text IS NULL OR cfu.formula_id = $4)
        GROUP BY p.id, p.name, p.brand
        ORDER BY total_actual_cost_cents DESC
      `;

    default:
      // Fallback to day grouping
      return buildGroupByQuery('day');
  }
}

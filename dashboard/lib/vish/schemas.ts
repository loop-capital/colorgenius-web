import { z } from "zod";

export const formulaSchema = z.object({
  clientId: z.string().min(1),
  stylistId: z.string().min(1),
  salonId: z.string().min(1),
  brand: z.string().min(1).max(100),
  shadeCode: z.string().min(1).max(50),
  shadeName: z.string().min(1).max(100),
  developerVolume: z.number().int().positive(),
  mixingRatio: z.string().min(1).max(20),
  processingTime: z.number().int().positive(),
  applicationTechnique: z.string().max(100).optional(),
  notes: z.string().optional(),
});

export const formulaUpdateSchema = formulaSchema.partial().omit({ clientId: true, stylistId: true, salonId: true });

export const formulaListQuerySchema = z.object({
  clientId: z.string().optional(),
  stylistId: z.string().optional(),
  salonId: z.string().optional(),
  brand: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const inventoryItemSchema = z.object({
  salon_id: z.string().min(1),
  brand: z.string().min(1).max(100),
  product_line: z.string().max(100).optional(),
  shade_code: z.string().min(1).max(50),
  shade_name: z.string().min(1).max(100),
  category: z.enum(["color", "developer", "treatment", "other"]).default("color"),
  quantity_on_hand: z.number().int().min(0).default(0),
  unit_of_measure: z.string().min(1).max(20).default("units"),
  low_stock_threshold: z.number().int().min(0).default(3),
  cost_per_unit: z.number().min(0).optional(),
  retail_price: z.number().min(0).optional(),
  reorder_point: z.number().int().min(0).optional(),
  reorder_quantity: z.number().int().min(0).optional(),
});

export const inventoryListQuerySchema = z.object({
  salon_id: z.string().min(1),
  brand: z.string().optional(),
  category: z.enum(["color", "developer", "treatment", "other"]).optional(),
  lowStock: z.coerce.boolean().optional(),
  source: z.enum(["square", "manual"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const pricingRuleSchema = z.object({
  salonId: z.string().min(1),
  serviceType: z.string().min(1).max(50),
  basePrice: z.number().positive(),
  pricePerOz: z.number().positive().optional(),
  minimumPrice: z.number().positive().optional(),
  effectiveDate: z.coerce.date(),
});

export const pricingRuleUpdateSchema = pricingRuleSchema.partial().omit({ salonId: true });

export const pricingListQuerySchema = z.object({
  salonId: z.string().min(1),
  serviceType: z.string().optional(),
  effectiveAfter: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type FormulaInput = z.infer<typeof formulaSchema>;
export type FormulaUpdateInput = z.infer<typeof formulaUpdateSchema>;
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
export type PricingRuleInput = z.infer<typeof pricingRuleSchema>;
export type PricingRuleUpdateInput = z.infer<typeof pricingRuleUpdateSchema>;

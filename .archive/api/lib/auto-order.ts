import { PrismaClient, Product, AutoOrderLog, AutoOrderStatus } from '../prisma/generated/client';

const prisma = new PrismaClient();

/**
 * Check all products that have auto-reorder enabled and whose
 * current stock is at or below the reorder threshold.
 */
export async function checkLowStock(): Promise<Product[]> {
  const lowStockProducts = await prisma.product.findMany({
    where: {
      autoReorder: true,
      currentStock: {
        lte: prisma.product.fields.reorderThreshold,
      },
    },
    include: {
      supplier: true,
    },
  });

  return lowStockProducts;
}

/**
 * Generate auto-order logs for products that are below their
 * reorder threshold. Returns the created logs.
 */
export async function generateAutoOrders(): Promise<AutoOrderLog[]> {
  const lowStockProducts = await checkLowStock();

  const logs: AutoOrderLog[] = [];

  for (const product of lowStockProducts) {
    if (!product.supplierId) {
      console.warn(`Product ${product.sku} has no supplierId, skipping auto-order.`);
      continue;
    }

    const log = await prisma.autoOrderLog.create({
      data: {
        productId: product.id,
        quantityOrdered: product.reorderQuantity,
        supplierId: product.supplierId,
        status: AutoOrderStatus.PENDING,
      },
    });

    logs.push(log);
  }

  return logs;
}

import { ProductRepository } from "../../products/application/ports/product.repository";
import { InventoryMovementRepository } from "./ports/inventory-movement.repository";
import { ID } from "../../../../shared/types";

export type StockItem = {
  productId: ID;
  productName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStock: number;
  isLowStock: boolean;
};

export type GetCurrentStockQuery = {
  productId?: ID;
  includeInactive?: boolean;
};

export type GetCurrentStockResult = {
  items: StockItem[];
  total: number;
  success: boolean;
  error?: string;
};

export const getCurrentStock = async (
  query: GetCurrentStockQuery = {},
  deps: { productRepo: ProductRepository; movementRepo: InventoryMovementRepository }
): Promise<GetCurrentStockResult> => {
  try {
    const { productId, includeInactive = false } = query;
    const products = await deps.productRepo.findAll(includeInactive);
    const movements = await deps.movementRepo.findAll(productId);

    const stockByProduct = new Map<ID, number>();
    for (const m of movements) {
      const current = stockByProduct.get(m.productId.toString()) ?? 0;
      stockByProduct.set(m.productId.toString(), current + m.quantity);
    }

    const items: StockItem[] = products.map((p) => {
      const productId = p.id.toString();
      const currentStock = stockByProduct.get(productId) ?? p.currentStock.toNumber();
      const minStock = p.minStock.toNumber();
      return {
        productId,
        productName: p.name,
        currentStock,
        reservedStock: 0, // TODO: implement reservations
        availableStock: Math.max(0, currentStock),
        minStock,
        isLowStock: currentStock <= minStock,
      };
    });

    return { items, total: items.length, success: true };
  } catch (error: any) {
    return { items: [], total: 0, success: false, error: error.message || "Error obteniendo existencia" };
  }
};
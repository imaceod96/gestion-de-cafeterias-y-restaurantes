import { Product } from "../../domain/entities/product";
import { ProductRepository } from "../ports/product.repository";
import { ID, Unit } from "../../../../shared/types";

export type UpdateProductCommand = {
  id: ID;
  name?: string;
  description?: string | null;
  unit?: Unit;
  categoryId?: ID;
  currentPurchasePrice?: number;
  currentSalePrice?: number;
  minStock?: number;
  isActive?: boolean;
};

export type UpdateProductResult = {
  product: Product | null;
  success: boolean;
  error?: string;
};

export const updateProduct = async (
  command: UpdateProductCommand,
  deps: { productRepo: ProductRepository }
): Promise<UpdateProductResult> => {
  try {
    const existing = await deps.productRepo.findById(command.id);
    if (!existing) {
      return { product: null, success: false, error: "Producto no encontrado" };
    }
    const data = existing.toData();
    const updated = Product.create({
      id: existing.id.toString(),
      categoryId: command.categoryId ?? data.categoryId,
      name: command.name ?? data.name,
      description: command.description !== undefined ? command.description : data.description,
      unit: command.unit ?? data.unit,
      currentPurchasePrice: command.currentPurchasePrice ?? data.currentPurchasePrice,
      currentSalePrice: command.currentSalePrice ?? data.currentSalePrice,
      currentStock: data.currentStock,
      minStock: command.minStock ?? data.minStock,
      isActive: command.isActive ?? data.isActive,
      photoUrl: data.photoUrl,
    });
    await deps.productRepo.save(updated);
    return { product: updated, success: true };
  } catch (error: any) {
    return { product: null, success: false, error: error.message || "Error actualizando producto" };
  }
};
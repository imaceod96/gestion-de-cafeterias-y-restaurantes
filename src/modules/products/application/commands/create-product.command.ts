import { Product } from "../../domain/entities/product";
import { ProductData } from "../../domain/entities/product";
import { EntityId } from "../../../shared/domain/value-objects";
import { ID } from "../../../shared/types";

export type CreateProductCommand = {
  name: string;
  description?: string | null;
  unit: Unit;
  categoryId: ID;
  currentPurchasePrice: number;
  currentSalePrice: number;
  currentStock?: number;
  minStock?: number;
  isActive?: boolean;
};

export type CreateProductResult = {
  product: Product;
  success: boolean;
  error?: string;
};

export const createProduct = async (
  command: CreateProductCommand
): Promise<CreateProductResult> => {
  try {
    const product = Product.create({
      id: EntityId.generate().toString(),
      categoryId: command.categoryId,
      name: command.name,
      description: command.description,
      unit: command.unit,
      currentPurchasePrice: command.currentPurchasePrice,
      currentSalePrice: command.currentSalePrice,
      currentStock: command.currentStock ?? 0,
      minStock: command.minStock ?? 0,
      isActive: command.isActive ?? true,
    });

    return {
      product,
      success: true,
    };
  } catch (error: any) {
    return {
      product: {} as Product,
      success: false,
      error: error.message || "Error creating product",
    };
  }
};
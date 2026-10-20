import { Product } from "../../domain/entities/product";
import { ProductRepository } from "../ports/product.repository";
import { CategoryRepository } from "../ports/product.repository";
import { ID, Unit } from "../../../../shared/types";

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
  command: CreateProductCommand,
  deps: { productRepo: ProductRepository; categoryRepo: CategoryRepository }
): Promise<CreateProductResult> => {
  try {
    if (!command.name?.trim()) {
      return { product: {} as Product, success: false, error: "El nombre es obligatorio" };
    }
    if (!command.categoryId) {
      return { product: {} as Product, success: false, error: "La categoría es obligatoria" };
    }
    const category = await deps.categoryRepo.findById(command.categoryId);
    if (!category) {
      return { product: {} as Product, success: false, error: "La categoría no existe" };
    }
    if (command.currentPurchasePrice < 0 || command.currentSalePrice < 0) {
      return { product: {} as Product, success: false, error: "Los precios no pueden ser negativos" };
    }

    const product = Product.create({
      categoryId: command.categoryId,
      name: command.name.trim(),
      description: command.description,
      unit: command.unit,
      currentPurchasePrice: command.currentPurchasePrice,
      currentSalePrice: command.currentSalePrice,
      currentStock: command.currentStock ?? 0,
      minStock: command.minStock ?? 0,
      isActive: command.isActive ?? true,
    });

    await deps.productRepo.save(product);
    return { product, success: true };
  } catch (error: any) {
    return { product: {} as Product, success: false, error: error.message || "Error creando producto" };
  }
};
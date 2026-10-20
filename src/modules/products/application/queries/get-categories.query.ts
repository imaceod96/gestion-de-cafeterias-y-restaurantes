import { Category } from "../../domain/entities/category";
import { CategoryRepository } from "../ports/product.repository";

export type GetCategoriesResult = {
  categories: Category[];
  success: boolean;
  error?: string;
};

export const getCategories = async (
  deps: { categoryRepo: CategoryRepository }
): Promise<GetCategoriesResult> => {
  try {
    const categories = await deps.categoryRepo.findAll();
    return { categories, success: true };
  } catch (error: any) {
    return { categories: [], success: false, error: error.message || "Error obteniendo categorías" };
  }
};
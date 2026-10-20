import { Category } from "../../domain/entities/category";
import { CategoryRepository } from "../ports/product.repository";
import { ID } from "../../../../shared/types";

export type CreateCategoryCommand = {
  name: string;
  description?: string | null;
};

export type CreateCategoryResult = {
  category: Category;
  success: boolean;
  error?: string;
};

export const createCategory = async (
  command: CreateCategoryCommand,
  deps: { categoryRepo: CategoryRepository }
): Promise<CreateCategoryResult> => {
  try {
    if (!command.name?.trim()) {
      return { category: {} as Category, success: false, error: "El nombre es obligatorio" };
    }
    const existing = await deps.categoryRepo.findAll();
    if (existing.some(c => c.name.toLowerCase() === command.name.trim().toLowerCase())) {
      return { category: {} as Category, success: false, error: "Ya existe una categoría con ese nombre" };
    }
    const category = Category.create({
      name: command.name.trim(),
      description: command.description,
    });
    await deps.categoryRepo.save(category);
    return { category, success: true };
  } catch (error: any) {
    return { category: {} as Category, success: false, error: error.message || "Error creando categoría" };
  }
};
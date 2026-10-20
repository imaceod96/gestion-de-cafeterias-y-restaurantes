import { Category } from "../../domain/entities/category";
import { CategoryRepository } from "../ports/product.repository";
import { ID } from "../../../../shared/types";

export type UpdateCategoryCommand = {
  id: ID;
  name?: string;
  description?: string | null;
};

export type UpdateCategoryResult = {
  category: Category | null;
  success: boolean;
  error?: string;
};

export const updateCategory = async (
  command: UpdateCategoryCommand,
  deps: { categoryRepo: CategoryRepository }
): Promise<UpdateCategoryResult> => {
  try {
    const existing = await deps.categoryRepo.findById(command.id);
    if (!existing) {
      return { category: null, success: false, error: "Categoría no encontrada" };
    }
    if (command.name !== undefined) {
      if (!command.name.trim()) {
        return { category: null, success: false, error: "El nombre es obligatorio" };
      }
      const all = await deps.categoryRepo.findAll();
      if (all.some(c => c.id.toString() !== command.id && c.name.toLowerCase() === command.name.trim().toLowerCase())) {
        return { category: null, success: false, error: "Ya existe una categoría con ese nombre" };
      }
    }
    const data = existing.toData();
    const updated = Category.create({
      id: existing.id.toString(),
      name: command.name ?? data.name,
      description: command.description !== undefined ? command.description : data.description,
    });
    await deps.categoryRepo.save(updated);
    return { category: updated, success: true };
  } catch (error: any) {
    return { category: null, success: false, error: error.message || "Error actualizando categoría" };
  }
};
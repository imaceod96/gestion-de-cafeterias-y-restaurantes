import { Product } from "../../domain/entities/product";
import { ProductRepository } from "../ports/product.repository";
import { ProductPhotoStorage } from "../ports/product-photo.storage";
import { ID } from "../../../../shared/types";

export type SetPhotoCommand = {
  productId: ID;
  fileName: string;
  contentType: string;
  data: Uint8Array;
};

export type SetPhotoResult = {
  product: Product | null;
  success: boolean;
  error?: string;
};

export const setPhoto = async (
  command: SetPhotoCommand,
  deps: { productRepo: ProductRepository; photoStorage: ProductPhotoStorage }
): Promise<SetPhotoResult> => {
  try {
    const product = await deps.productRepo.findById(command.productId);
    if (!product) {
      return { product: null, success: false, error: "Producto no encontrado" };
    }

    // Remove previous photo if exists
    if (product.photoUrl) {
      try {
        await deps.photoStorage.remove(product.photoUrl);
      } catch {
        // Non-fatal: continue even if removal fails
      }
    }

    const stored = await deps.photoStorage.save(command.productId, command.fileName, command.contentType, command.data);
    const updated = product.withPhoto(stored.url);
    await deps.productRepo.save(updated);
    return { product: updated, success: true };
  } catch (error: any) {
    return { product: null, success: false, error: error.message || "Error guardando fotografía" };
  }
};
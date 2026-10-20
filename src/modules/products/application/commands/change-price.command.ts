import { Product } from "../../domain/entities/product";
import { PriceHistory } from "../../domain/entities/price-history";
import { ProductRepository } from "../ports/product.repository";
import { PriceHistoryRepository } from "../ports/price-history.repository";
import { ID, PriceType } from "../../../../shared/types";

export type ChangePriceCommand = {
  productId: ID;
  priceType: PriceType;
  newPrice: number;
  changedBy?: string | null;
};

export type ChangePriceResult = {
  product: Product | null;
  priceHistory: PriceHistory | null;
  success: boolean;
  error?: string;
};

export const changePrice = async (
  command: ChangePriceCommand,
  deps: { productRepo: ProductRepository; priceHistoryRepo: PriceHistoryRepository }
): Promise<ChangePriceResult> => {
  try {
    const product = await deps.productRepo.findById(command.productId);
    if (!product) {
      return { product: null, priceHistory: null, success: false, error: "Producto no encontrado" };
    }
    if (command.newPrice < 0) {
      return { product: null, priceHistory: null, success: false, error: "El precio no puede ser negativo" };
    }

    const oldPrice = command.priceType === "compra"
      ? product.currentPurchasePrice.toNumber()
      : product.currentSalePrice.toNumber();

    const updated = product.withUpdatedPrice(command.priceType, command.newPrice);
    await deps.productRepo.save(updated);

    const history = PriceHistory.create({
      productId: command.productId,
      priceType: command.priceType,
      oldPrice,
      newPrice: command.newPrice,
      changedBy: command.changedBy ?? null,
    });
    await deps.priceHistoryRepo.save(history);

    return { product: updated, priceHistory: history, success: true };
  } catch (error: any) {
    return { product: null, priceHistory: null, success: false, error: error.message || "Error cambiando precio" };
  }
};
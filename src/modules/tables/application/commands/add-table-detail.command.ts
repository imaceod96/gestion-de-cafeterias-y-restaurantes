import { TableAccount } from "../../domain/entities/table-account";
import { TableAccountDetail } from "../../domain/entities/table-account";
import { TableAccountRepository } from "../ports/table-account.repository";
import { ProductRepository } from "../../../products/application/ports/product.repository";
import { ID } from "../../../../shared/types";

export type AddTableDetailCommand = {
  accountId: ID;
  productId: ID;
  quantity?: number;
};

export type AddTableDetailResult = {
  account: TableAccount | null;
  detail: TableAccountDetail | null;
  success: boolean;
  error?: string;
};

export const addTableDetail = async (
  command: AddTableDetailCommand,
  deps: {
    tableAccountRepo: TableAccountRepository;
    productRepo: ProductRepository;
  }
): Promise<AddTableDetailResult> => {
  try {
    const { accountId, productId, quantity: requestedQuantity = 1 } = command;

    const account = await deps.tableAccountRepo.findById(accountId);
    if (!account) {
      return { account: null, detail: null, success: false, error: "Cuenta de mesa no encontrada" };
    }

    if (!account.isOpen()) {
      return { account: null, detail: null, success: false, error: "La cuenta está cerrada" };
    }

    const product = await deps.productRepo.findById(productId);
    if (!product) {
      return { account: null, detail: null, success: false, error: "Producto no encontrado" };
    }

    if (!product.isActive) {
      return { account: null, detail: null, success: false, error: "El producto está inactivo" };
    }

    const currentStock = product.currentStock.toNumber();
    if (currentStock <= 0) {
      return { account: null, detail: null, success: false, error: "El producto está agotado" };
    }

    // Check if product already exists in account details
    const existingIndex = account.details.findIndex((d) => d.productId.toString() === productId.toString());
    const quantity = existingIndex !== -1
      ? account.details[existingIndex].quantity.toNumber() + requestedQuantity
      : requestedQuantity;

    if (quantity > currentStock) {
      return { account: null, detail: null, success: false, error: "Stock insuficiente" };
    }

    const unitSalePrice = product.currentSalePrice.toNumber();
    const unitCost = product.currentPurchasePrice.toNumber();
    const total = unitSalePrice * quantity;

    if (existingIndex !== -1) {
      // Update existing detail
      const existingDetail = account.details[existingIndex];
      const updatedDetail = TableAccountDetail.create({
        id: existingDetail.id.toString(),
        accountId,
        productId,
        productName: product.name,
        quantity,
        unitSalePrice,
        unitCost,
        total,
      });

      const newDetails = [...account.details];
      newDetails[existingIndex] = updatedDetail;

      const updatedAccount = account.replaceDetails(newDetails);
      const savedAccount = await deps.tableAccountRepo.save(updatedAccount);
      return { account: savedAccount, detail: updatedDetail, success: true };
    }

    // Create new detail
    const newDetail = TableAccountDetail.create({
      id: `detail-${Date.now()}`,
      accountId,
      productId,
      productName: product.name,
      quantity,
      unitSalePrice,
      unitCost,
      total,
    });

    const newDetails = [...account.details, newDetail];
    const updatedAccount = account.replaceDetails(newDetails);
    const savedAccount = await deps.tableAccountRepo.save(updatedAccount);

    return { account: savedAccount, detail: newDetail, success: true };
  } catch (error: any) {
    return { account: null, detail: null, success: false, error: error.message || "Error agregando detalle" };
  }
};
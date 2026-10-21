import { TableAccount } from "../../domain/entities/table-account";
import { TableAccountDetail } from "../../domain/entities/table-account";
import { TableAccountRepository } from "../ports/table-account.repository";
import { ProductRepository } from "../../../products/application/ports/product.repository";
import { ID } from "../../../../shared/types";

export type UpdateTableDetailCommand = {
  accountId: ID;
  detailId: ID;
  quantity: number;
};

export type UpdateTableDetailResult = {
  account: TableAccount | null;
  detail: TableAccountDetail | null;
  success: boolean;
  error?: string;
};

export const updateTableDetail = async (
  command: UpdateTableDetailCommand,
  deps: {
    tableAccountRepo: TableAccountRepository;
    productRepo: ProductRepository;
  }
): Promise<UpdateTableDetailResult> => {
  try {
    const { accountId, detailId, quantity } = command;

    if (quantity < 0) {
      return { account: null, detail: null, success: false, error: "La cantidad no puede ser negativa" };
    }

    const account = await deps.tableAccountRepo.findById(accountId);
    if (!account) {
      return { account: null, detail: null, success: false, error: "Cuenta de mesa no encontrada" };
    }

    if (!account.isOpen()) {
      return { account: null, detail: null, success: false, error: "La cuenta está cerrada" };
    }

    const detailIndex = account.details.findIndex((d) => d.id.toString() === detailId.toString());
    if (detailIndex === -1) {
      return { account: null, detail: null, success: false, error: "Detalle no encontrado" };
    }

    const existingDetail = account.details[detailIndex];
    const product = await deps.productRepo.findById(existingDetail.productId.toString());
    if (!product) {
      return { account: null, detail: null, success: false, error: "Producto no encontrado" };
    }

    const currentStock = product.currentStock.toNumber();
    if (quantity > currentStock) {
      return { account: null, detail: null, success: false, error: "Stock insuficiente" };
    }

    if (quantity === 0) {
      // Remove the detail
      const newDetails = account.details.filter((d) => d.id.toString() !== detailId.toString());
      const newTotal = newDetails.reduce((sum, d) => sum + d.total.toNumber(), 0);
      const newTotalCost = newDetails.reduce((sum, d) => sum + d.unitCost.toNumber() * d.quantity.toNumber(), 0);
      
      const updatedAccount = account.replaceDetails(newDetails);
      const savedAccount = await deps.tableAccountRepo.save(updatedAccount);
      return { account: savedAccount, detail: null, success: true };
    }

    // Update quantity
    const unitSalePrice = existingDetail.unitSalePrice.toNumber();
    const unitCost = existingDetail.unitCost.toNumber();
    const total = unitSalePrice * quantity;

    const updatedDetail = TableAccountDetail.create({
      id: existingDetail.id.toString(),
      accountId,
      productId: existingDetail.productId.toString(),
      productName: existingDetail.productName,
      quantity,
      unitSalePrice,
      unitCost,
      total,
    });

    const newDetails = [...account.details];
    newDetails[detailIndex] = updatedDetail;
    
    const newTotal = newDetails.reduce((sum, d) => sum + d.total.toNumber(), 0);
    const newTotalCost = newDetails.reduce((sum, d) => sum + d.unitCost.toNumber() * d.quantity.toNumber(), 0);
    
    const updatedAccount = account.replaceDetails(newDetails);
    const savedAccount = await deps.tableAccountRepo.save(updatedAccount);

    return { account: savedAccount, detail: updatedDetail, success: true };
  } catch (error: any) {
    return { account: null, detail: null, success: false, error: error.message || "Error actualizando detalle" };
  }
};
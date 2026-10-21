import { TableAccount } from "../../domain/entities/table-account";
import { TableAccountRepository } from "../ports/table-account.repository";
import { SaleRepository } from "../../../sales/application/ports/sale.repository";
import { VoucherRepository } from "../../../sales/application/ports/voucher.repository";
import { Voucher } from "../../../sales/domain/entities/voucher";
import { Sale, SaleDetail } from "../../../sales/domain/entities/sale";
import { ProductRepository } from "../../../products/application/ports/product.repository";
import { InventoryMovementRepository } from "../../../inventory/application/ports/inventory-movement.repository";
import { InventoryMovement } from "../../../inventory/domain/entities/inventory-movement";
import { ID } from "../../../../shared/types";

export type CloseTableCommand = {
  accountId: ID;
  tableId?: ID;
};

export type CloseTableResult = {
  account: TableAccount | null;
  voucher: Voucher | null;
  success: boolean;
  error?: string;
};

export const closeTable = async (
  command: CloseTableCommand,
  deps: {
    tableAccountRepo: TableAccountRepository;
    saleRepo: SaleRepository;
    voucherRepo: VoucherRepository;
    productRepo: ProductRepository;
    movementRepo: InventoryMovementRepository;
  }
): Promise<CloseTableResult> => {
  try {
    const { accountId, tableId } = command;

    const account = await deps.tableAccountRepo.findById(accountId);
    if (!account) {
      return { account: null, voucher: null, success: false, error: "Cuenta de mesa no encontrada" };
    }

    if (!account.isOpen()) {
      return { account: null, voucher: null, success: false, error: "La cuenta ya está cerrada" };
    }

    // Create a sale from the account details
    const total = account.total.toNumber();
    const totalCost = account.totalCost.toNumber();
    const totalProfit = total - totalCost;

    const saleDetails: SaleDetail[] = account.details.map((d) =>
          SaleDetail.create({
            saleId: "",
            productId: d.productId.toString(),
            productName: d.productName,
            quantity: d.quantity.toNumber(),
            unitSalePrice: d.unitSalePrice.toNumber(),
            unitCost: d.unitCost.toNumber(),
            total: d.total.toNumber(),
            createdAt: d.createdAt.toISOString(),
          })
        );

    const sale = Sale.create({
      origin: "mesa",
      originId: tableId ?? null,
      total,
      totalCost,
      totalProfit,
      itemCount: account.details.length,
    });

    const detailsWithSaleId = saleDetails.map((d) =>
      SaleDetail.create({
        id: d.id.toString(),
        saleId: sale.id.toString(),
        productId: d.productId.toString(),
        productName: d.productName,
        quantity: d.quantity.toNumber(),
        unitSalePrice: d.unitSalePrice.toNumber(),
        unitCost: d.unitCost.toNumber(),
        total: d.total.toNumber(),
        createdAt: d.createdAt.toISOString(),
      })
    );

    const saleWithDetails = Sale.fromData(sale.toData(), detailsWithSaleId);
    const savedSale = await deps.saleRepo.save(saleWithDetails);

    // Create voucher linked to the sale
    const voucher = Voucher.create({
      code: `VALE-${Date.now()}`,
      status: "cerrado",
      total,
      saleId: savedSale.id.toString(),
      createdBy: null,
      openedAt: new Date().toISOString(),
      closedAt: new Date().toISOString(),
    });
    const savedVoucher = await deps.voucherRepo.save(voucher);

    // Close the account with the sale's ID
    const closedAccount = account.close(savedSale.id.toString());
    const savedAccount = await deps.tableAccountRepo.save(closedAccount);

    return { account: savedAccount, voucher: savedVoucher, success: true };
  } catch (error: any) {
    return { account: null, voucher: null, success: false, error: error.message || "Error cerrando mesa" };
  }
};
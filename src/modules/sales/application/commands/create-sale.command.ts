import { Sale, SaleDetail } from "../../domain/entities/sale";
import { Voucher } from "../../domain/entities/voucher";
import { SaleRepository } from "../ports/sale.repository";
import { VoucherRepository } from "../ports/voucher.repository";
import { ProductRepository } from "../../../products/application/ports/product.repository";
import { InventoryMovementRepository } from "../../../inventory/application/ports/inventory-movement.repository";
import { InventoryMovement } from "../../../inventory/domain/entities/inventory-movement";
import { ID, SaleOrigin } from "../../../../shared/types";

export type CreateSaleItem = {
  productId: ID;
  quantity: number;
};

export type CreateSaleCommand = {
  origin: SaleOrigin;
  originId?: string | null;
  items: CreateSaleItem[];
};

export type CreateSaleResult = {
  sale: Sale | null;
  voucher: Voucher | null;
  success: boolean;
  error?: string;
};

export const createSale = async (
  command: CreateSaleCommand,
  deps: {
    saleRepo: SaleRepository;
    voucherRepo: VoucherRepository;
    productRepo: ProductRepository;
    movementRepo: InventoryMovementRepository;
  }
): Promise<CreateSaleResult> => {
  try {
    const { origin, originId, items } = command;

    if (!items || items.length === 0) {
      return { sale: null, voucher: null, success: false, error: "No hay productos en la compra" };
    }

    // Build sale details and validate stock
    const details: SaleDetail[] = [];
    let total = 0;
    let totalCost = 0;

    for (const item of items) {
      const product = await deps.productRepo.findById(item.productId);
      if (!product) {
        return { sale: null, voucher: null, success: false, error: `Producto no encontrado: ${item.productId}` };
      }

      if (!product.isActive) {
        return { sale: null, voucher: null, success: false, error: `El producto ${product.name} está inactivo` };
      }

      const currentStock = product.currentStock.toNumber();
      if (currentStock <= 0) {
        return { sale: null, voucher: null, success: false, error: `El producto ${product.name} está agotado` };
      }

      if (item.quantity > currentStock) {
        return { sale: null, voucher: null, success: false, error: `Stock insuficiente para ${product.name}` };
      }

      const unitSalePrice = product.currentSalePrice.toNumber();
      const unitCost = product.currentPurchasePrice.toNumber();
      const itemTotal = unitSalePrice * item.quantity;

      const detail = SaleDetail.create({
        saleId: "", // will be set after sale creation
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitSalePrice,
        unitCost,
        total: itemTotal,
      });

      details.push(detail);
      total += itemTotal;
      totalCost += unitCost * item.quantity;

      // Create inventory movement (sale reduces stock)
      const movement = InventoryMovement.create({
        productId: item.productId,
        type: "sale",
        quantity: -item.quantity,
        previousStock: currentStock,
        newStock: currentStock - item.quantity,
        reason: `Venta ${origin === "vale" ? "por vale" : "por mesa"}`,
        referenceId: originId ?? null,
        referenceType: origin,
      });
      await deps.movementRepo.save(movement);

      // Update product stock
      const updatedProduct = product.withStockChange(-item.quantity);
      await deps.productRepo.save(updatedProduct);
    }

    const totalProfit = total - totalCost;

    const sale = Sale.create({
      origin,
      originId: originId ?? null,
      total,
      totalCost,
      totalProfit,
      itemCount: details.length,
    });

    // Set saleId on details
    const detailsWithSaleId = details.map((d) =>
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

    // Create voucher
    const voucher = Voucher.create({
      code: `VALE-${savedSale.id.toString().slice(0, 8)}-${Date.now()}`,
      status: "cerrado",
      total,
      saleId: savedSale.id.toString(),
      createdBy: null,
      openedAt: new Date().toISOString(),
      closedAt: new Date().toISOString(),
    });
    const savedVoucher = await deps.voucherRepo.save(voucher);

    return { sale: savedSale, voucher: savedVoucher, success: true };
  } catch (error: any) {
    return { sale: null, voucher: null, success: false, error: error.message || "Error creando venta" };
  }
};
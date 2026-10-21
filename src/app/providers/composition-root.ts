import { QueryClient } from "@tanstack/react-query";
import { ProductRepository } from "@/modules/products/application/ports/product.repository";
import { CategoryRepository } from "@/modules/products/application/ports/product.repository";
import { HttpProductRepository } from "@/modules/products/infrastructure/persistence/http-product.repository";
import { HttpCategoryRepository } from "@/modules/products/infrastructure/persistence/http-category.repository";
import { HttpUnitRepository } from "@/modules/products/infrastructure/persistence/http-unit.repository";
import { HttpTableRepository } from "@/modules/tables/infrastructure/persistence/http-table.repository";
import { HttpTableAccountRepository } from "@/modules/tables/infrastructure/persistence/http-table-account.repository";
import { MerchandiseEntryRepository } from "@/modules/warehouse/application/ports/merchandise-entry.repository";
import { HttpMerchandiseEntryRepository } from "@/modules/warehouse/infrastructure/persistence/http-merchandise-entry.repository";
import { InventoryMovementRepository } from "@/modules/inventory/application/ports/inventory-movement.repository";
import { HttpInventoryMovementRepository } from "@/modules/inventory/infrastructure/persistence/http-inventory-movement.repository";
import { PriceHistoryRepository } from "@/modules/products/application/ports/price-history.repository";
import { HttpPriceHistoryRepository } from "@/modules/products/infrastructure/persistence/http-price-history.repository";
import { ProductPhotoStorage } from "@/modules/products/application/ports/product-photo.storage";
import { HttpProductPhotoStorage } from "@/modules/products/infrastructure/persistence/http-product-photo.storage";
import { SaleRepository } from "@/modules/sales/application/ports/sale.repository";
import { HttpSaleRepository } from "@/modules/sales/infrastructure/persistence/http-sale.repository";
import { VoucherRepository } from "@/modules/sales/application/ports/voucher.repository";
import { HttpVoucherRepository } from "@/modules/sales/infrastructure/persistence/http-voucher.repository";
import { TableAccountRepository } from "@/modules/tables/application/ports/table-account.repository";

export function createQueryClient() {
  return new QueryClient();
}

export function createDeps() {
  const productRepo = new HttpProductRepository();
  const categoryRepo = new HttpCategoryRepository();
  const unitRepo = new HttpUnitRepository();
  const tableRepo = new HttpTableRepository();
  const tableAccountRepo = new HttpTableAccountRepository();
  const merchandiseEntryRepo = new HttpMerchandiseEntryRepository();
  const movementRepo = new HttpInventoryMovementRepository();
  const priceHistoryRepo = new HttpPriceHistoryRepository();
  const photoStorage = new HttpProductPhotoStorage();

  return {
    // Products module
    productRepo,
    categoryRepo,
    unitRepo,

    // Tables module
    tableRepo,
    tableAccountRepo,

    // Warehouse module
    merchandiseEntryRepo,

    // Inventory module
    movementRepo,

    // Sales module
    saleRepo: new HttpSaleRepository(),
    voucherRepo: new HttpVoucherRepository(),

    // Cross-cutting
    priceHistoryRepo,
    photoStorage,
  };
}

export function useAppQueryClient() {
  return createQueryClient();
}

export function useAppDeps() {
  return createDeps();
}
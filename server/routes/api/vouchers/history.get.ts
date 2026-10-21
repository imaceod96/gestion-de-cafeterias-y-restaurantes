import { defineHandler } from "nitro";
import { createError } from "nitro/h3";
import { SqliteVoucherRepository } from "@server/infrastructure/persistence/sales/voucher.repository";
import { SqliteSaleRepository } from "@server/infrastructure/persistence/sales/sale.repository";

const voucherRepo = new SqliteVoucherRepository();
const saleRepo = new SqliteSaleRepository();

export default defineHandler(async (event) => {
  const vouchers = await voucherRepo.findAll();
  const result = await Promise.all(
    vouchers
      .filter((v) => v.isClosed())
      .map(async (v) => {
        const sale = v.saleId ? await saleRepo.findById(v.saleId.toString()) : null;
        return {
          id: v.id.toString(),
          code: v.code,
          status: v.status,
          total: v.total.toNumber(),
          saleId: v.saleId?.toString() ?? null,
          createdBy: v.createdBy,
          openedAt: v.openedAt.toISOString(),
          closedAt: v.closedAt?.toISOString() ?? null,
          createdAt: v.createdAt.toISOString(),
          details: sale?.details.map((d) => d.toData()) ?? [],
        };
      })
  );
  return result;
});
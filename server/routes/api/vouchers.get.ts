import { defineHandler } from "nitro";
import { createError } from "nitro/h3";
import { SqliteVoucherRepository } from "@server/infrastructure/persistence/sales/voucher.repository";

const voucherRepo = new SqliteVoucherRepository();

export default defineHandler(async (event) => {
  const vouchers = await voucherRepo.findAll();
  return vouchers.map((v) => v.toData());
});
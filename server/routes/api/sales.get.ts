import { defineHandler } from "nitro";
import { createError } from "nitro/h3";
import { SqliteSaleRepository } from "@server/infrastructure/persistence/sales/sale.repository";

const saleRepo = new SqliteSaleRepository();

export default defineHandler(async (event) => {
  const sales = await saleRepo.findAll();
  return sales.map((s) => s.toData());
});
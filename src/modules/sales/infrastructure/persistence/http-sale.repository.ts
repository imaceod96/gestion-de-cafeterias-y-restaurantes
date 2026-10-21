import { Sale, SaleDetail } from "../../domain/entities/sale";
import { SaleRepository } from "../../application/ports/sale.repository";
import { ID } from "../../../../shared/types";

export class HttpSaleRepository implements SaleRepository {
  async findAll(): Promise<Sale[]> {
    const res = await fetch("/api/sales");
    if (!res.ok) throw new Error("Error obteniendo ventas");
    const data = await res.json();
    return data.map((row: any) => {
      const details = row.details?.map((d: any) => ({
        id: d.id,
        saleId: d.saleId,
        productId: d.productId,
        productName: d.productName,
        quantity: d.quantity,
        unitSalePrice: d.unitSalePrice,
        unitCost: d.unitCost,
        total: d.total,
        createdAt: d.createdAt,
      })) ?? [];
      return Sale.fromData(
        {
          id: row.id,
          origin: row.origin,
          originId: row.originId,
          total: row.total,
          totalCost: row.totalCost,
          totalProfit: row.totalProfit,
          itemCount: row.itemCount,
          saleDate: row.saleDate,
          createdAt: row.createdAt,
        },
        details
      );
    });
  }

  async findById(id: ID): Promise<Sale | null> {
    const res = await fetch(`/api/sales/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Error obteniendo venta");
    const row = await res.json();
    const details = row.details?.map((d: any) => ({
      id: d.id,
      saleId: d.saleId,
      productId: d.productId,
      productName: d.productName,
      quantity: d.quantity,
      unitSalePrice: d.unitSalePrice,
      unitCost: d.unitCost,
      total: d.total,
      createdAt: d.createdAt,
    })) ?? [];
    return Sale.fromData(
      {
        id: row.id,
        origin: row.origin,
        originId: row.originId,
        total: row.total,
        totalCost: row.totalCost,
        totalProfit: row.totalProfit,
        itemCount: row.itemCount,
        saleDate: row.saleDate,
        createdAt: row.createdAt,
      },
      details
    );
  }

  async save(sale: Sale): Promise<Sale> {
    // Sales are created server-side via POST /api/sales
    throw new Error("Use POST /api/sales to create a sale");
  }
}
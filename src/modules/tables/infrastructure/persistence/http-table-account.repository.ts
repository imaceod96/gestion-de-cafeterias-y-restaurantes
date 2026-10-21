import { TableAccount } from "../../domain/entities/table-account";
import { TableAccountRepository } from "../../application/ports/table-account.repository";
import { ID } from "../../../../shared/types";

export class HttpTableAccountRepository implements TableAccountRepository {
  async findAll(): Promise<TableAccount[]> {
    const res = await fetch("/api/table-accounts");
    if (!res.ok) throw new Error("Error obteniendo cuentas de mesa");
    const data = await res.json();
    return data.map((row: any) => {
      const details = row.details?.map((d: any) => ({
        id: d.id,
        accountId: d.accountId,
        productId: d.productId,
        productName: d.productName,
        quantity: d.quantity,
        unitSalePrice: d.unitSalePrice,
        unitCost: d.unitCost,
        total: d.total,
        addedAt: d.addedAt,
        createdAt: d.createdAt,
      })) ?? [];
      return TableAccount.fromData(
        {
          id: row.id,
          tableId: row.tableId,
          status: row.status,
          total: row.total,
          totalCost: row.totalCost,
          itemCount: row.itemCount,
          openedAt: row.openedAt,
          closedAt: row.closedAt,
          saleId: row.saleId,
          createdAt: row.createdAt,
        },
        details
      );
    });
  }

  async findOpen(): Promise<TableAccount[]> {
    const res = await fetch("/api/table-accounts?open=true");
    if (!res.ok) throw new Error("Error obteniendo cuentas abiertas");
    const data = await res.json();
    return data.map((row: any) => {
      const details = row.details?.map((d: any) => ({
        id: d.id,
        accountId: d.accountId,
        productId: d.productId,
        productName: d.productName,
        quantity: d.quantity,
        unitSalePrice: d.unitSalePrice,
        unitCost: d.unitCost,
        total: d.total,
        addedAt: d.addedAt,
        createdAt: d.createdAt,
      })) ?? [];
      return TableAccount.fromData(
        {
          id: row.id,
          tableId: row.tableId,
          status: row.status,
          total: row.total,
          totalCost: row.totalCost,
          itemCount: row.itemCount,
          openedAt: row.openedAt,
          closedAt: row.closedAt,
          saleId: row.saleId,
          createdAt: row.createdAt,
        },
        details
      );
    });
  }

  async findById(id: ID): Promise<TableAccount | null> {
    const res = await fetch(`/api/table-accounts/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Error obteniendo cuenta de mesa");
    const row = await res.json();
    const details = row.details?.map((d: any) => ({
      id: d.id,
      accountId: d.accountId,
      productId: d.productId,
      productName: d.productName,
      quantity: d.quantity,
      unitSalePrice: d.unitSalePrice,
      unitCost: d.unitCost,
      total: d.total,
      addedAt: d.addedAt,
      createdAt: d.createdAt,
    })) ?? [];
    return TableAccount.fromData(
      {
        id: row.id,
        tableId: row.tableId,
        status: row.status,
        total: row.total,
        totalCost: row.totalCost,
        itemCount: row.itemCount,
        openedAt: row.openedAt,
        closedAt: row.closedAt,
        saleId: row.saleId,
        createdAt: row.createdAt,
      },
      details
    );
  }

  async findByTableId(tableId: ID): Promise<TableAccount | null> {
    const res = await fetch(`/api/table-accounts?tableId=${tableId}`);
    if (!res.ok) throw new Error("Error obteniendo cuenta de mesa");
    const row = await res.json();
    if (!row) return null;
    const details = row.details?.map((d: any) => ({
      id: d.id,
      accountId: d.accountId,
      productId: d.productId,
      productName: d.productName,
      quantity: d.quantity,
      unitSalePrice: d.unitSalePrice,
      unitCost: d.unitCost,
      total: d.total,
      addedAt: d.addedAt,
      createdAt: d.createdAt,
    })) ?? [];
    return TableAccount.fromData(
      {
        id: row.id,
        tableId: row.tableId,
        status: row.status,
        total: row.total,
        totalCost: row.totalCost,
        itemCount: row.itemCount,
        openedAt: row.openedAt,
        closedAt: row.closedAt,
        saleId: row.saleId,
        createdAt: row.createdAt,
      },
      details
    );
  }

  async save(account: TableAccount): Promise<TableAccount> {
    const res = await fetch(`/api/table-accounts/${account.id.toString()}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account.toData()),
    });
    if (!res.ok) throw new Error("Error guardando cuenta de mesa");
    const row = await res.json();
    const details = row.details?.map((d: any) => ({
      id: d.id,
      accountId: d.accountId,
      productId: d.productId,
      productName: d.productName,
      quantity: d.quantity,
      unitSalePrice: d.unitSalePrice,
      unitCost: d.unitCost,
      total: d.total,
      addedAt: d.addedAt,
      createdAt: d.createdAt,
    })) ?? [];
    return TableAccount.fromData(
      {
        id: row.id,
        tableId: row.tableId,
        status: row.status,
        total: row.total,
        totalCost: row.totalCost,
        itemCount: row.itemCount,
        openedAt: row.openedAt,
        closedAt: row.closedAt,
        saleId: row.saleId,
        createdAt: row.createdAt,
      },
      details
    );
  }
}
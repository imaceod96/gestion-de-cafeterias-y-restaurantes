import { getDatabase } from "@server/infrastructure/database/client";
import { Voucher } from "@/modules/sales/domain/entities/voucher";
import { VoucherRepository } from "@/modules/sales/application/ports/voucher.repository";
import { ID } from "@/shared/types";

export class SqliteVoucherRepository implements VoucherRepository {
  async findAll(): Promise<Voucher[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM vouchers ORDER BY created_at DESC")
      .all() as any[];
    return rows.map((row) =>
      Voucher.fromData({
        id: row.id,
        code: row.code,
        status: row.status,
        total: row.total,
        saleId: row.sale_id,
        createdBy: row.created_by,
        openedAt: row.opened_at,
        closedAt: row.closed_at,
        createdAt: row.created_at,
      })
    );
  }

  async findById(id: ID): Promise<Voucher | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM vouchers WHERE id = ?").get(id) as any | undefined;
    if (!row) return null;
    return Voucher.fromData({
      id: row.id,
      code: row.code,
      status: row.status,
      total: row.total,
      saleId: row.sale_id,
      createdBy: row.created_by,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
      createdAt: row.created_at,
    });
  }

  async findByCode(code: string): Promise<Voucher | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM vouchers WHERE code = ?").get(code) as any | undefined;
    if (!row) return null;
    return Voucher.fromData({
      id: row.id,
      code: row.code,
      status: row.status,
      total: row.total,
      saleId: row.sale_id,
      createdBy: row.created_by,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
      createdAt: row.created_at,
    });
  }

  async save(voucher: Voucher): Promise<Voucher> {
    const db = getDatabase();
    const data = voucher.toData();
    db.prepare(
      `INSERT INTO vouchers (id, code, status, total, sale_id, created_by, opened_at, closed_at, created_at, updated_at)
       VALUES (@id, @code, @status, @total, @saleId, @createdBy, @openedAt, @closedAt, @createdAt, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET
         code = @code,
         status = @status,
         total = @total,
         sale_id = @saleId,
         created_by = @createdBy,
         opened_at = @openedAt,
         closed_at = @closedAt,
         updated_at = @updatedAt`
    ).run({
      id: data.id,
      code: data.code,
      status: data.status,
      total: data.total,
      saleId: data.saleId,
      createdBy: data.createdBy,
      openedAt: data.openedAt,
      closedAt: data.closedAt,
      createdAt: data.createdAt,
      updatedAt: new Date().toISOString(),
    });
    return voucher;
  }
}
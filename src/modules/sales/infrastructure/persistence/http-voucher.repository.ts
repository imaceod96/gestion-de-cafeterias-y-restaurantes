import { Voucher } from "../../domain/entities/voucher";
import { VoucherRepository } from "../../application/ports/voucher.repository";
import { ID } from "../../../../shared/types";

export class HttpVoucherRepository implements VoucherRepository {
  async findAll(): Promise<Voucher[]> {
    const res = await fetch("/api/vouchers");
    if (!res.ok) throw new Error("Error obteniendo vales");
    const data = await res.json();
    return data.map((row: any) =>
      Voucher.fromData({
        id: row.id,
        code: row.code,
        status: row.status,
        total: row.total,
        saleId: row.saleId,
        createdBy: row.createdBy,
        openedAt: row.openedAt,
        closedAt: row.closedAt,
        createdAt: row.createdAt,
      })
    );
  }

  async findById(id: ID): Promise<Voucher | null> {
    const res = await fetch(`/api/vouchers/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Error obteniendo vale");
    const row = await res.json();
    return Voucher.fromData({
      id: row.id,
      code: row.code,
      status: row.status,
      total: row.total,
      saleId: row.saleId,
      createdBy: row.createdBy,
      openedAt: row.openedAt,
      closedAt: row.closedAt,
      createdAt: row.createdAt,
    });
  }

  async findByCode(code: string): Promise<Voucher | null> {
    const res = await fetch(`/api/vouchers?code=${encodeURIComponent(code)}`);
    if (!res.ok) throw new Error("Error obteniendo vale");
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const row = data[0];
    return Voucher.fromData({
      id: row.id,
      code: row.code,
      status: row.status,
      total: row.total,
      saleId: row.saleId,
      createdBy: row.createdBy,
      openedAt: row.openedAt,
      closedAt: row.closedAt,
      createdAt: row.createdAt,
    });
  }

  async save(voucher: Voucher): Promise<Voucher> {
    // Vouchers are created server-side
    throw new Error("Vouchers are created server-side only");
  }
}
import { Voucher } from "../../domain/entities/voucher";
import { ID } from "../../../../shared/types";

export interface VoucherRepository {
  findAll(): Promise<Voucher[]>;
  findById(id: ID): Promise<Voucher | null>;
  findByCode(code: string): Promise<Voucher | null>;
  save(voucher: Voucher): Promise<Voucher>;
}
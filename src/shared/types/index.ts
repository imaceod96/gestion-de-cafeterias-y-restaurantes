export type ID = string;
export type ISODate = string;
export type ISODateTime = string;

export type Money = number;
export type Quantity = number;

export type Role = "admin" | "dependiente";

export type SaleOrigin = "vale" | "mesa";

export type InventoryMovementType = "entry" | "sale" | "adjustment";

export type TableStatus = "libre" | "abierta";

export type PriceType = "compra" | "venta";

export type Unit = string;

export type CutStatus = "pendiente" | "completado";

export type AdjustmentReason =
  | "perdida"
  | "robada"
  | "dañada"
  | "sobrante"
  | "error";

export type VoucherStatus = "abierto" | "cerrado";

export type AccountStatus = "abierta" | "cerrada";
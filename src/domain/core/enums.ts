export enum MovementType {
  ENTRY = "entry",
  SALE = "sale",
  ADJUSTMENT = "adjustment",
}

export enum SaleOrigin {
  VALE = "vale",
  MESAS = "mesa",
}

export enum TableStatus {
  LIBRE = "libre",
  ABIERTA = "abierta",
}

export enum PriceType {
  COMPRA = "compra",
  VENTA = "venta",
}

export enum Unit {
  UNIDAD = "unidad",
  KG = "kg",
  G = "g",
  L = "l",
  ML = "ml",
  CAJA = "caja",
  DOCENA = "docena",
}

export enum UserRole {
  ADMIN = "admin",
  DEPENDIENTE = "dependiente",
}

export enum CutStatus {
  PENDIENTE = "pendiente",
  COMPLETADO = "completado",
}

export enum AdjustmentReason {
  PERDIDA = "perdida",
  ROBADA = "robada",
  DANADA = "dañada",
  SOBRANTE = "sobrante",
  ERROR = "error",
}
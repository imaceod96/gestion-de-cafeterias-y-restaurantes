import { Price } from "../domain/value-objects";

export function formatMoney(amount: number, currency: string = "MXN"): string {
  return `${amount.toFixed(2)} ${currency}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatStock(quantity: number): string {
  return quantity === 0 ? "Sin stock" : `${quantity} ${quantity > 1 ? "unidades" : "unidad"}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isValidPrice(price: number): boolean {
  return !isNaN(price) && price >= 0;
}

export function isValidQuantity(quantity: number): boolean {
  return !isNaN(quantity) && quantity >= 0;
}
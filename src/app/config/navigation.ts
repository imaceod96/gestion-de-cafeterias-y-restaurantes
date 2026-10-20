import {
  Boxes,
  ClipboardList,
  Coffee,
  History,
  LayoutGrid,
  PackagePlus,
  Receipt,
  ScanLine,
  UtensilsCrossed,
  Warehouse,
} from "lucide-react";

export const APP_NAME = "Cafetería Manager";
export const APP_TAGLINE = "Gestión de operaciones de cafetería";

/**
 * Primary navigation — the two daily actions of the business.
 * Rendered as the visual centerpiece of the home screen.
 */
export const primaryActions = [
  {
    key: "crear-vale",
    label: "CREAR VALE",
    description: "Venta inmediata",
    to: "/ventas/vale",
    icon: Receipt,
    tone: "caramel" as const,
  },
  {
    key: "mesas",
    label: "MESAS",
    description: "Cuentas abiertas",
    to: "/mesas",
    icon: UtensilsCrossed,
    tone: "coffee" as const,
  },
];

/**
 * Administrative navigation — grouped by bounded context.
 * The "almacen" group is the administrative menu of the warehouse module.
 */
export const administrativeNavigation = [
  {
    key: "almacen",
    label: "ALMACÉN",
    icon: Warehouse,
    items: [
      {
        label: "Ingresar mercancía",
        description: "Entrada de compras al almacén",
        to: "/almacen/ingresar-mercancia",
        icon: PackagePlus,
      },
      {
        label: "Existencia actual",
        description: "Existencias vigentes por producto",
        to: "/almacen/existencia-actual",
        icon: Boxes,
      },
      {
        label: "Inventario",
        description: "Movimientos e inventario general del día",
        to: "/almacen/inventario",
        icon: ScanLine,
      },
    ],
  },
  {
    key: "catalogo",
    label: "CATÁLOGO",
    icon: Coffee,
    items: [
      {
        label: "Productos",
        description: "Catálogo y precios actuales",
        to: "/productos",
        icon: ClipboardList,
      },
    ],
  },
  {
    key: "cortes",
    label: "CORTES",
    icon: LayoutGrid,
    items: [
      {
        label: "Cortes de inventario",
        description: "Conteos físicos y diferencias",
        to: "/cortes",
        icon: ScanLine,
      },
    ],
  },
];

/**
 * Sales navigation — for sales operations and history.
 */
export const salesNavigation = [
  {
    key: "ventas",
    label: "VALES",
    icon: Receipt,
    items: [
      {
        label: "Crear vale",
        description: "Venta inmediata",
        to: "/ventas/vale",
        icon: Receipt,
      },
    ],
  },
  {
    key: "mesas-section",
    label: "MESAS",
    icon: UtensilsCrossed,
    items: [
      {
        label: "Mesas abiertas",
        description: "Cuentas activas",
        to: "/mesas",
        icon: UtensilsCrossed,
      },
    ],
  },
];

/**
 * History navigation — for historical records.
 */
export const historyNavigation = [
  {
    key: "historial",
    label: "HISTORIAL",
    icon: History,
    items: [
      {
        label: "Vales",
        description: "Historial de vales cerrados",
        to: "/historial/vales",
        icon: Receipt,
      },
      {
        label: "Mesas",
        description: "Historial de mesas cerradas",
        to: "/historial/mesas",
        icon: UtensilsCrossed,
      },
    ],
  },
];
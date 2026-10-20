import { ModulePlaceholder } from "@/shared/ui/layout/ModulePlaceholder";
import { ScanLine } from "lucide-react";

export function InventarioPage() {
  return (
    <ModulePlaceholder
      icon={ScanLine}
      title="Inventario"
      description="Movimientos e inventario general del día. Esta funcionalidad será desarrollada próximamente."
      plannedItems={[
        "Historial completo de movimientos de inventario",
        "Filtros por tipo: Entrada, Venta, Ajuste",
        "Inventario físico diario",
        "Reportes de diferencias",
        "Exportación a Excel/PDF",
      ]}
    />
  );
}
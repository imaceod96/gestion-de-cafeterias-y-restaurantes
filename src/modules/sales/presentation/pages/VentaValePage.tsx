import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { ModulePlaceholder } from "@/shared/ui/layout/ModulePlaceholder";
import { Receipt } from "lucide-react";

export default function VentaValePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="CREAR VALE"
        description="Venta inmediata: selecciona productos, cantidad y total."
      />
      <ModulePlaceholder
        icon={Receipt}
        title="Venta por vale"
        description="El flujo de venta inmediata se desarrollará aquí: catálogo, totales y cierre."
        plannedItems={[
          "Selección de productos del catálogo",
          "Totales y pagos",
          "Impresión y cierre del vale",
        ]}
      />
    </div>
  );
}
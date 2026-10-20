import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { ModulePlaceholder } from "@/shared/ui/layout/ModulePlaceholder";
import { PackagePlus } from "lucide-react";

export function IngresarMercanciaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ingresar mercancía"
        description="Registro de compras e incorporación de mercancía al almacén."
      />
      <ModulePlaceholder
        icon={PackagePlus}
        title="Ingreso de mercancía preparado"
        description="Este formulario generará una entrada de mercancía, un movimiento de inventario por producto y, cuando corresponda, un nuevo precio de compra con su historial."
        plannedItems={[
          "Selección de producto y cantidad",
          "Costo de compra por unidad",
          "Proveedor, notas y fecha de la entrada",
          "Actualización automática del precio de compra e historial",
        ]}
      />
    </div>
  );
}
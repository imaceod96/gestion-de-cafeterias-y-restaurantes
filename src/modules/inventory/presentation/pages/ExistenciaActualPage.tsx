import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { ModulePlaceholder } from "@/shared/ui/layout/ModulePlaceholder";
import { Boxes } from "lucide-react";

export default function ExistenciaActualPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Existencia Actual"
        description="Existencias vigentes por producto con alertas de stock bajo."
      />
      <ModulePlaceholder
        icon={Boxes}
        title="Existencia actual"
        description="La vista de existencias se desarrollará aquí: tabla con stock actual, stock mínimo y alertas."
        plannedItems={[
          "Tabla de existencias por producto",
          "Indicador de stock bajo",
          "Filtros por categoría",
        ]}
      />
    </div>
  );
}
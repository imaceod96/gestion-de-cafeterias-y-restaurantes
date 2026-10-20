import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { ModulePlaceholder } from "@/shared/ui/layout/ModulePlaceholder";
import { Package } from "lucide-react";

export function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catálogo de productos, categorías, unidades de medida y precios actuales."
      />
      <ModulePlaceholder
        icon={Package}
        title="Módulo de productos preparado"
        description="El catálogo, las categorías, el historial de precios y la fotografía de producto se desarrollarán aquí, de forma independiente al resto de módulos."
        plannedItems={[
          "Alta y edición de productos y categorías",
          "Precios de compra y venta con historial",
          "Fotografía del producto",
        ]}
      />
    </div>
  );
}
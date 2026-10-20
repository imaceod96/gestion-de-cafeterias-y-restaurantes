import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { ModulePlaceholder } from "@/shared/ui/layout/ModulePlaceholder";
import { UtensilsCrossed } from "lucide-react";

export default function MesasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mesas"
        description="Cuentas abiertas por mesa: crear mesa, agregar productos, cerrar y pagar."
      />
      <ModulePlaceholder
        icon={UtensilsCrossed}
        title="Gestión de mesas"
        description="El flujo de mesas se desarrollará aquí: crear mesa, agregar productos, cerrar y pagar."
        plannedItems={[
          "Creación y apertura de mesa",
          "Adición de productos a la cuenta",
          "Cierre y pago de la mesa",
        ]}
      />
    </div>
  );
}
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { ModulePlaceholder } from "@/shared/ui/layout/ModulePlaceholder";
import { AlertCircle } from "lucide-react";

export function NotFound() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Página no encontrada"
        description="La ruta solicitada no existe en el sistema."
      />
      <ModulePlaceholder
        icon={AlertCircle}
        title="404 - Ruta no encontrada"
        description="La página que estás buscando no está disponible en este momento. Por favor, verifica la URL o navega desde la pantalla principal."
        plannedItems={[
          "Redirección a pantalla principal",
          "Página de error personalizada",
        ]}
      />
    </div>
  );
}
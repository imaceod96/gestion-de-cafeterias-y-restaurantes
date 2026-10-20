import { Receipt, UtensilsCrossed } from "lucide-react";
import { primaryActions } from "@/app/config/navigation";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { ModulePlaceholder } from "@/shared/ui/layout/ModulePlaceholder";

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-coffee-50">
      <div className="text-center w-full max-w-2xl">
        <PageHeader
          title="Cafetería Manager"
          description="Gestión de operaciones de cafetería"
        />
        <div className="mt-8 space-y-4">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.key}
                className="group bg-white rounded-xl border border-coffee-200 p-6 hover:border-coffee-400 transition-colors cursor-pointer"
              >
                <Icon
                  className="w-12 h-12 mx-auto mb-4 text-coffee-500 group-hover:text-coffee-700 transition-colors"
                />
                <h3 className="text-xl font-bold text-coffee-900">{action.label}</h3>
                <p className="text-coffee-600 mt-2 line-clamp-2">{action.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
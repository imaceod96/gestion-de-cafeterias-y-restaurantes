"use client";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { Badge } from "@/shared/ui/badge";
import { createDeps } from "@/app/providers/composition-root";
import { getOpenTables } from "@/modules/tables/application/queries/get-open-tables.query";
import { UtensilsCrossed, Loader2 } from "lucide-react";

const deps = createDeps();

export default function MesasPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["open-tables"],
    queryFn: () => getOpenTables({ includeClosed: false }, { tableRepo: deps.tableRepo }),
    staleTime: 30000,
  });

  const tables = data?.tables ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mesas"
        description="Cuentas abiertas por mesa: agregar productos, cerrar y pagar."
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-coffee-200 p-4 animate-pulse">
              <div className="h-8 bg-coffee-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-coffee-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-12 text-coffee-500">
          <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No hay mesas abiertas</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => (
            <div
              key={table.id.toString()}
              className="bg-white rounded-lg border border-coffee-200 p-4 hover:border-caramel transition-colors cursor-pointer"
              onClick={() => navigate(`/mesa/${table.id.toString()}`)}
            >
              <div className="text-2xl font-bold text-coffee-900 mb-1">Mesa #{table.number}</div>
              <div className="text-sm text-coffee-600 truncate">{table.name || "Sin nombre"}</div>
              <div className="mt-2">
                <Badge className="bg-green-100 text-green-800 text-xs">Abierta</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

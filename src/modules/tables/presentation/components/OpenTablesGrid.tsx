import { useQuery } from "@tanstack/react-query";
import { createDeps } from "@/app/providers/composition-root";
import { getOpenTables } from "@/modules/tables/application/queries/get-open-tables.query";

export function OpenTablesGrid() {
  const deps = createDeps();

  const { data, isLoading } = useQuery({
    queryKey: ["open-tables"],
    queryFn: () => getOpenTables({ includeClosed: false }, { tableRepo: deps.tableRepo }),
    staleTime: 30000,
  });

  const tables = data?.tables ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-coffee-900">Mesas Abiertas</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-coffee-200 p-4 animate-pulse">
              <div className="h-8 bg-coffee-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-coffee-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-12 text-coffee-500">
          <p className="text-sm">No hay mesas abiertas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table) => (
            <div
              key={table.id.toString()}
              className="bg-white rounded-lg border border-coffee-200 p-4 hover:border-coffee-300 transition-colors cursor-pointer"
            >
              <div className="text-2xl font-bold text-coffee-900 mb-1">{table.number}</div>
              <div className="text-sm text-coffee-600 truncate">{table.name || "Sin nombre"}</div>
              <div className="mt-2 flex items-center gap-1 text-xs text-coffee-500">
                <span className="px-2 py-0.5 rounded-full bg-coffee-100 text-coffee-700 capitalize">
                  {table.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
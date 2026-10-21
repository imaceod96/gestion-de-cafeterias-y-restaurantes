import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Badge } from "@/shared/ui/badge";
import { Package, AlertTriangle } from "lucide-react";
import { createDeps } from "@/app/providers/composition-root";
import { getCurrentStock } from "@/modules/inventory/application/queries/get-current-stock.query";
import { ProductThumbnail } from "@/shared/ui/product-thumbnail";

const deps = createDeps();

export function ProductAvailabilityMenu() {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["product-availability"],
    queryFn: () =>
      getCurrentStock(
        { includeInactive: true },
        { productRepo: deps.productRepo, movementRepo: deps.movementRepo }
      ),
    staleTime: 30000,
  });

  const items = data?.items ?? [];

  const agotados = items.filter((i) => i.availability === "agotado");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-coffee-100 text-coffee-700 hover:bg-coffee-200 transition-colors relative"
          title="Estado de productos"
        >
          <Package className="h-5 w-5" />
          {agotados.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {agotados.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 bg-white border-coffee-200">
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-coffee-900">
              PRODUCTOS AGOTADOS
            </h3>
            <Badge
              className={
                agotados.length > 0
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {agotados.length}
            </Badge>
          </div>
          {isLoading ? (
            <div className="text-center py-4 text-coffee-500">
              <Package className="h-6 w-6 mx-auto mb-2 animate-pulse" />
              Cargando...
            </div>
          ) : agotados.length === 0 ? (
            <div className="text-center py-4 text-coffee-500">
              <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay productos agotados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {agotados.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-2 rounded-lg bg-red-50 border border-red-200"
                >
                  <ProductThumbnail
                    photoUrl={null}
                    name={item.productName}
                    unit={item.unit}
                    size="sm"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-coffee-900 truncate">
                      {item.productName}
                    </span>
                    <span className="text-xs text-red-600 font-medium">
                      AGOTADO
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Badge } from "@/shared/ui/badge";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";
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

  const disponibles = items.filter((i) => i.availability === "disponible");
  const agotados = items.filter((i) => i.availability === "agotado");
  const desactivados = items.filter((i) => i.availability === "desactivado");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-coffee-100 text-coffee-700 hover:bg-coffee-200 transition-colors"
          title="Estado de productos"
        >
          <Package className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 bg-white border-coffee-200">
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-coffee-900">
              DISPONIBLES
            </h3>
            <Badge className="bg-green-100 text-green-800">
              {disponibles.length}
            </Badge>
          </div>
          {disponibles.length === 0 ? (
            <p className="text-xs text-coffee-500">Ningún producto disponible</p>
          ) : (
            <div className="space-y-1">
              {disponibles.slice(0, 8).map((item) => (
                <div key={item.productId} className="text-xs">
                  <ProductThumbnail
                    photoUrl={null}
                    name={item.productName}
                    unit={item.unit}
                    size="xs"
                  />
                  <div className="ml-6 text-coffee-600">
                    {item.currentStock} {item.unit}
                  </div>
                </div>
              ))}
              {disponibles.length > 8 && (
                <p className="text-xs text-coffee-500">
                  +{disponibles.length - 8} más
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-coffee-900">
              AGOTADOS
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
          {agotados.length === 0 ? (
            <p className="text-xs text-coffee-500">Ningún producto agotado</p>
          ) : (
            <div className="space-y-1">
              {agotados.slice(0, 8).map((item) => (
                <div key={item.productId} className="text-xs">
                  <ProductThumbnail
                    photoUrl={null}
                    name={item.productName}
                    unit={item.unit}
                    size="xs"
                  />
                  <div className="ml-6 text-coffee-600">
                    {item.currentStock} {item.unit}
                  </div>
                </div>
              ))}
              {agotados.length > 8 && (
                <p className="text-xs text-coffee-500">
                  +{agotados.length - 8} más
                </p>
              )}
            </div>
          )}

          {desactivados.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-coffee-900">
                  DESACTIVADOS
                </h3>
                <Badge className="bg-gray-100 text-gray-800">
                  {desactivados.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {desactivados.slice(0, 5).map((item) => (
                  <div key={item.productId} className="text-xs">
                    <ProductThumbnail
                      photoUrl={null}
                      name={item.productName}
                      unit={item.unit}
                      size="xs"
                    />
                    <div className="ml-6 text-coffee-600">
                      {item.currentStock} {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

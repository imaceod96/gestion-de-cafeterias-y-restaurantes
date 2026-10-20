import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Search, Boxes, AlertTriangle, Package, CheckCircle, Power } from "lucide-react";
import { createDeps } from "@/app/providers/composition-root";
import { getCurrentStock } from "@/modules/inventory/application/queries/get-current-stock.query";
import { getCategories } from "@/modules/products/application/queries/get-categories.query";
import { Category } from "@/modules/products/domain/entities/category";
import { ProductThumbnail } from "@/shared/ui/product-thumbnail";

const deps = createDeps();

export function ExistenciaActualPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  const { data: stockData, isLoading } = useQuery({
    queryKey: ["stock"],
    queryFn: () =>
      getCurrentStock(
        { includeInactive: false },
        { productRepo: deps.productRepo, movementRepo: deps.movementRepo }
      ),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ categoryRepo: deps.categoryRepo }),
  });

  const items = stockData?.items ?? [];
  const categories = categoriesData?.categories ?? [];

  const categoryNameById = new Map(
    categories.map((c: Category) => [c.id.toString(), c.name])
  );

  const enrichedItems = items.map((item) => ({
    ...item,
    categoryName: categoryNameById.get(item.categoryId) ?? null,
  }));

  const filteredItems = enrichedItems.filter((item) => {
    const matchesSearch = item.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.categoryId === categoryFilter;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && item.isLowStock) ||
      (stockFilter === "ok" && !item.isLowStock);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockCount = items.filter((i) => i.isLowStock).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Existencia Actual"
        description="Existencias vigentes por producto con alertas de stock bajo."
        actions={
          <div className="flex items-center gap-2">
            {lowStockCount > 0 && (
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {lowStockCount} producto(s) con stock bajo
              </Badge>
            )}
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-coffee-200 focus:border-caramel"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 border-coffee-200">
              <SelectValue placeholder="Filtrar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat: Category) => (
                <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-40 border-coffee-200">
              <SelectValue placeholder="Filtrar stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="low">Stock bajo</SelectItem>
              <SelectItem value="ok">Stock suficiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-coffee-100/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-coffee-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-coffee-50">
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Stock actual</TableHead>
                <TableHead className="text-right">Stock mínimo</TableHead>
                <TableHead className="text-right">Reservado</TableHead>
                <TableHead className="text-right">Disponible</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Unidad</TableHead>
                <TableHead className="text-center">Categoría</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-coffee-500">
                    <Boxes className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.productId} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ProductThumbnail
                          photoUrl={null}
                          name={item.productName}
                          unit={item.unit}
                          size="sm"
                        />
                        <div>
                          <div className="font-medium text-coffee-900">{item.productName}</div>
                          <div className="text-sm text-coffee-500">ID: {item.productId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-coffee-900">
                      {item.currentStock}
                    </TableCell>
                    <TableCell className="text-right text-coffee-700">
                      {item.minStock}
                    </TableCell>
                    <TableCell className="text-right text-coffee-700">
                      {item.reservedStock}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={item.availableStock <= 0 ? "text-red-600" : "text-coffee-900"}>
                        {item.availableStock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.availability === "desactivado" ? (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          <Power className="h-3 w-3 mr-1" />
                          DESACTIVADO
                        </Badge>
                      ) : item.availability === "agotado" ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          AGOTADO
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          DISPONIBLE
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-coffee-700">
                      {item.unit}
                    </TableCell>
                    <TableCell className="text-center text-coffee-700">
                      {item.categoryName || "Sin categoría"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

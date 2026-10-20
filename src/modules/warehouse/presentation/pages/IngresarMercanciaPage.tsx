import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { PackagePlus, Loader2, Search } from "lucide-react";
import { createDeps } from "@/app/providers/composition-root";
import { getProducts } from "@/modules/products/application/queries/get-products.query";
import { createMerchandiseEntry } from "@/modules/warehouse/application/commands/create-merchandise-entry.command";
import { Product } from "@/modules/products/domain/entities/product";

const deps = createDeps();

export function IngresarMercanciaPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [unitSalePrice, setUnitSalePrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ activeOnly: true }, { productRepo: deps.productRepo }),
  });

  const products = productsData?.products ?? [];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (command: any) =>
      createMerchandiseEntry(command, {
        entryRepo: deps.merchandiseEntryRepo,
        productRepo: deps.productRepo,
        movementRepo: deps.movementRepo,
        priceHistoryRepo: deps.priceHistoryRepo,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      setSelectedProductId("");
      setQuantity("");
      setUnitCost("");
      setUnitSalePrice("");
      setSupplier("");
      setNotes("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProductId || !quantity || !unitCost || !unitSalePrice) return;
  
      createMutation.mutate({
        productId: selectedProductId,
        quantity: Number(quantity),
        unitCost: Number(unitCost),
        unitSalePrice: Number(unitSalePrice),
        supplier: supplier || null,
        notes: notes || null,
        entryDate,
      });
    };

  const selectedProduct = products.find((p) => p.id.toString() === selectedProductId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ingresar mercancía"
        description="Registro de compras e incorporación de mercancía al almacén."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-coffee-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-coffee-900">Nueva entrada de mercancía</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Producto *</Label>
                <div className="relative">
                  <PackagePlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Buscar y seleccionar producto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading ? (
                        <div className="py-4 text-center text-coffee-500">Cargando productos...</div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="py-4 text-center text-coffee-500">
                          {searchTerm ? "No se encontraron productos" : "No hay productos disponibles"}
                        </div>
                      ) : (
                        <>
                          <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
                            <Input
                              placeholder="Filtrar productos..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          {filteredProducts.map((product) => (
                            <SelectItem key={product.id.toString()} value={product.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{product.name}</span>
                                <span className="text-xs text-coffee-500">
                                  Stock: {product.currentStock.toNumber()} {product.unit}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitCost">Costo unitario *</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitSalePrice">Precio venta *</Label>
                  <Input
                    id="unitSalePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitSalePrice}
                    onChange={(e) => setUnitSalePrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryDate">Fecha de entrada *</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Input
                  id="supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Nombre del proveedor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones adicionales"
                  rows={3}
                />
              </div>

              {selectedProduct && (
                              <div className="rounded-lg bg-coffee-50 p-4 border border-coffee-200">
                                <h3 className="mb-2 font-medium text-coffee-900">Resumen de la entrada</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-coffee-600">Producto: </span>
                                    <span className="font-medium text-coffee-900">{selectedProduct.name}</span>
                                  </div>
                                  <div>
                                    <span className="text-coffee-600">Stock actual: </span>
                                    <span className="font-medium text-coffee-900">
                                      {selectedProduct.currentStock.toNumber()} {selectedProduct.unit}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-coffee-600">Nuevo stock: </span>
                                    <span className="font-medium text-coffee-900">
                                      {selectedProduct.currentStock.toNumber() + Number(quantity || 0)} {selectedProduct.unit}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-coffee-600">Total compra: </span>
                                    <span className="font-medium text-coffee-900">
                                      ${(Number(quantity || 0) * Number(unitCost || 0)).toFixed(2)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-coffee-600">Precio venta: </span>
                                    <span className="font-medium text-coffee-900">
                                      ${Number(unitSalePrice || 0).toFixed(2)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-coffee-600">Ganancia/unidad: </span>
                                    <span className="font-medium text-coffee-900">
                                      ${(Number(unitSalePrice || 0) - Number(unitCost || 0)).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

              <div className="flex justify-end gap-2 pt-4 border-t border-coffee-200">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !selectedProductId || !quantity || !unitCost || !unitSalePrice}
                  className="bg-caramel hover:bg-caramel/90 text-coffee-900"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <PackagePlus className="h-4 w-4 mr-2" />
                      Registrar entrada
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="rounded-lg border border-coffee-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-coffee-900">Productos recientes</h3>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-coffee-100/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-coffee-500">
              <PackagePlus className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No hay productos registrados</p>
              <p className="text-sm">Ve a <a href="/productos" className="text-caramel underline">Productos</a> para crear uno</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.slice(0, 10).map((product) => (
                <div
                  key={product.id.toString()}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedProductId === product.id.toString()
                      ? "bg-caramel/20 border border-caramel"
                      : "hover:bg-coffee-50"
                  }`}
                  onClick={() => setSelectedProductId(product.id.toString())}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-coffee-100 flex items-center justify-center">
                      <PackagePlus className="h-4 w-4 text-caramel" />
                    </div>
                    <div>
                      <div className="font-medium text-coffee-900">{product.name}</div>
                      <div className="text-xs text-coffee-500">
                        Stock: {product.currentStock.toNumber()} {product.unit}
                      </div>
                    </div>
                  </div>
                  {selectedProductId === product.id.toString() && (
                    <div className="w-5 h-5 rounded-full bg-caramel border-2 border-white" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
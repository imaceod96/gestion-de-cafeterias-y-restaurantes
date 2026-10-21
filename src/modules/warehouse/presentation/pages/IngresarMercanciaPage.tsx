import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { CalendarIcon, Package, Image, Loader2, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";
import { createDeps } from "@/app/providers/composition-root";
import { getProducts } from "@/modules/products/application/queries/get-products.query";
import { getUnits } from "@/modules/products/application/queries/get-units.query";
import { getCategories } from "@/modules/products/application/queries/get-categories.query";
import { createProduct } from "@/modules/products/application/commands/create-product.command";
import { createUnit } from "@/modules/products/application/commands/manage-unit.command";
import { setPhoto } from "@/modules/products/application/commands/set-photo.command";
import { createMerchandiseEntry } from "@/modules/warehouse/application/commands/create-merchandise-entry.command";
import { Product } from "@/modules/products/domain/entities/product";
import { Unit } from "@/modules/products/domain/entities/unit";
import { ID } from "@/shared/types";

const deps = createDeps();

export function IngresarMercanciaPage() {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPhoto, setNewProductPhoto] = useState<File | null>(null);
  const [newProductPhotoPreview, setNewProductPhotoPreview] = useState<string | null>(null);

  const [quantity, setQuantity] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [unitCost, setUnitCost] = useState("");
  const [unitSalePrice, setUnitSalePrice] = useState("");
  const [entryDate, setEntryDate] = useState<Date>(new Date());

  // State for creating a new unit inline
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitAbbreviation, setNewUnitAbbreviation] = useState("");

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ activeOnly: true }, { productRepo: deps.productRepo }),
  });

  const { data: unitsData } = useQuery({
    queryKey: ["units"],
    queryFn: () => getUnits({ unitRepo: deps.unitRepo }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ categoryRepo: deps.categoryRepo }),
  });

  const products = productsData?.products ?? [];
  const units = unitsData?.units ?? [];
  const categories = categoriesData?.categories ?? [];

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const selectedUnitObj = units.find(
    (u) => u.abbreviation === selectedUnit || u.name === selectedUnit
  );

  const profitMargin = useMemo(() => {
    const cost = parseFloat(unitCost);
    const sale = parseFloat(unitSalePrice);
    if (cost > 0 && sale > 0) {
      return ((sale / cost) * 100 - 100).toFixed(2);
    }
    return null;
  }, [unitCost, unitSalePrice]);

  const totalCost = useMemo(() => {
    const cost = parseFloat(unitCost);
    const qty = parseFloat(quantity);
    if (cost > 0 && qty > 0) {
      return (cost * qty).toFixed(2);
    }
    return null;
  }, [unitCost, quantity]);

  const createProductMutation = useMutation({
    mutationFn: (command: any) =>
      createProduct(command, { productRepo: deps.productRepo, categoryRepo: deps.categoryRepo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ productId, file }: { productId: ID; file: File }) => {
      const data = new Uint8Array(await file.arrayBuffer());
      return setPhoto(
        { productId, fileName: file.name, contentType: file.type, data },
        { productRepo: deps.productRepo, photoStorage: deps.photoStorage }
      );
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: (command: any) =>
      createMerchandiseEntry(command, {
        entryRepo: deps.merchandiseEntryRepo,
        productRepo: deps.productRepo,
        movementRepo: deps.movementRepo,
        priceHistoryRepo: deps.priceHistoryRepo,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["merchandise-entries"] });
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: (command: { name: string; abbreviation: string }) =>
      createUnit(command, { unitRepo: deps.unitRepo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setIsCreatingUnit(false);
      setNewUnitName("");
      setNewUnitAbbreviation("");
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProductPhoto(file);
      setNewProductPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateNewProduct = async () => {
    if (!newProductName.trim()) return;

    const unit = selectedUnit || (units[0]?.abbreviation ?? "unid");
    const categoryId = categories[0]?.id.toString() ?? "";

    const result = await createProductMutation.mutateAsync({
      name: newProductName.trim(),
      description: null,
      unit,
      categoryId,
      currentPurchasePrice: 0,
      currentSalePrice: 0,
    });

    if (result.success && result.product) {
      if (newProductPhoto) {
        await uploadPhotoMutation.mutateAsync({
          productId: result.product.id.toString(),
          file: newProductPhoto,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      const updatedProducts = await queryClient.fetchQuery({
        queryKey: ["products"],
        queryFn: () => getProducts({ activeOnly: true }, { productRepo: deps.productRepo }),
      });
      const newProduct = updatedProducts.products.find(
        (p) => p.id.toString() === result.product.id.toString()
      );
      if (newProduct) {
        setSelectedProduct(newProduct);
      }
    }

    setShowNewProductForm(false);
    setNewProductName("");
    setNewProductPhoto(null);
    setNewProductPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert("Selecciona un producto");
      return;
    }

    const qty = parseFloat(quantity);
    const cost = parseFloat(unitCost);
    const sale = parseFloat(unitSalePrice);

    if (isNaN(qty) || qty <= 0) {
      alert("La cantidad debe ser mayor que 0");
      return;
    }
    if (isNaN(cost) || cost <= 0) {
      alert("El costo unitario debe ser mayor que 0");
      return;
    }
    if (isNaN(sale) || sale <= 0) {
      alert("El precio de venta debe ser mayor que 0");
      return;
    }

    const result = await createEntryMutation.mutateAsync({
      productId: selectedProduct.id.toString(),
      quantity: qty,
      unit: selectedUnit,
      unitCost: cost,
      unitSalePrice: sale,
      entryDate: entryDate.toISOString(),
    });

    if (result.success) {
      setSelectedProduct(null);
      setQuantity("");
      setSelectedUnit("");
      setUnitCost("");
      setUnitSalePrice("");
      setEntryDate(new Date());
      setShowNewProductForm(false);
      setNewProductName("");
      setNewProductPhoto(null);
      setNewProductPhotoPreview(null);
    } else {
      alert(result.error || "Error al guardar la entrada");
    }
  };

  const handleCancel = () => {
    setSelectedProduct(null);
    setQuantity("");
    setSelectedUnit("");
    setUnitCost("");
    setUnitSalePrice("");
    setEntryDate(new Date());
    setShowNewProductForm(false);
    setNewProductName("");
    setNewProductPhoto(null);
    setNewProductPhotoPreview(null);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductPickerOpen(false);
    setShowNewProductForm(false);

    // Prefill unit and prices from the product's current values
    const unitMatch = units.find((u) => u.abbreviation === product.unit || u.name === product.unit);
    if (unitMatch) {
      setSelectedUnit(unitMatch.abbreviation);
    } else if (units.length > 0) {
      setSelectedUnit(units[0].abbreviation);
    }
    setUnitCost(product.currentPurchasePrice.toNumber().toString());
    setUnitSalePrice(product.currentSalePrice.toNumber().toString());
  };

  const handleSelectNewProduct = () => {
    setIsProductPickerOpen(false);
    setShowNewProductForm(true);
  };

  const handleSelectUnit = (value: string) => {
    setSelectedUnit(value);
    if (!showNewProductForm) {
      // Prefill unit cost with product default if available
      if (selectedProduct) {
        setUnitCost(selectedProduct.currentPurchasePrice.toNumber().toString());
        setUnitSalePrice(selectedProduct.currentSalePrice.toNumber().toString());
      }
    }
  };

  const handleCreateUnit = async () => {
    if (!newUnitName.trim() || !newUnitAbbreviation.trim()) return;
    const result = await createUnitMutation.mutateAsync({
      name: newUnitName.trim(),
      abbreviation: newUnitAbbreviation.trim(),
    });
    if (result.success && result.unit) {
      setSelectedUnit(result.unit.abbreviation);
      setIsCreatingUnit(false);
      setNewUnitName("");
      setNewUnitAbbreviation("");
    } else {
      alert(result.error || "Error creando unidad");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ingresar Mercancía"
        description="Registra nuevas entradas de productos al inventario"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={isProductPickerOpen} onOpenChange={setIsProductPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={selectedProduct ? "default" : "outline"}
                  className="w-full justify-between h-auto py-3"
                >
                  {selectedProduct ? (
                    <div className="flex items-center gap-3">
                      {selectedProduct.photoUrl ? (
                        <img
                          src={selectedProduct.photoUrl}
                          alt={selectedProduct.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-coffee-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-coffee-400" />
                        </div>
                      )}
                      <div className="text-left">
                        <div className="font-medium">{selectedProduct.name}</div>
                        <div className="text-sm text-coffee-500">
                          {selectedProduct.description}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-coffee-500">Selecciona un producto</span>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="max-h-96 overflow-y-auto">
                  {/* + NUEVO PRODUCTO option */}
                  <div
                    className="cursor-pointer px-3 py-2 hover:bg-coffee-50 border-b border-coffee-100"
                    onClick={handleSelectNewProduct}
                  >
                    <div className="font-medium text-caramel">+ NUEVO PRODUCTO</div>
                  </div>

                  {/* Existing products sorted alphabetically */}
                  {sortedProducts.map((product) => (
                    <div
                      key={product.id.toString()}
                      className="cursor-pointer px-3 py-2 hover:bg-coffee-50 flex items-center gap-3"
                      onClick={() => handleSelectProduct(product)}
                    >
                      {product.photoUrl ? (
                        <img
                          src={product.photoUrl}
                          alt={product.name}
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-coffee-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-coffee-400" />
                        </div>
                      )}
                      <span className="text-sm">{product.name}</span>
                    </div>
                  ))}

                  {sortedProducts.length === 0 && (
                    <div className="px-3 py-2 text-coffee-500 text-sm">
                      No hay productos
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* New Product Form */}
            {showNewProductForm && (
              <div className="mt-4 p-4 bg-coffee-50 rounded-lg border border-coffee-200 space-y-3">
                <h4 className="font-medium text-coffee-900">Nuevo Producto</h4>

                <div className="space-y-2">
                  <Label htmlFor="newProductName">Nombre del producto *</Label>
                  <Input
                    id="newProductName"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Nombre del nuevo producto"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newProductPhoto">Fotografía</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      id="newProductPhoto"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("newProductPhoto")?.click()}
                      className="bg-white border-coffee-200 hover:border-caramel"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      {newProductPhoto ? "Cambiar foto" : "Subir foto"}
                    </Button>
                    {newProductPhotoPreview && (
                      <div className="relative">
                        <img
                          src={newProductPhotoPreview}
                          alt="Preview"
                          className="h-16 w-16 rounded-lg object-cover border border-coffee-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowNewProductForm(false);
                      setNewProductName("");
                      setNewProductPhoto(null);
                      setNewProductPhotoPreview(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateNewProduct}
                    disabled={!newProductName.trim() || createProductMutation.isPending}
                    className="bg-caramel hover:bg-caramel/90 text-coffee-900"
                  >
                    {createProductMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Crear Producto
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quantity and Unit */}
        <Card>
          <CardHeader>
            <CardTitle>Cantidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidad de medida *</Label>
                                <Select value={selectedUnit} onValueChange={handleSelectUnit}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar unidad" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {units.map((unit) => (
                                      <SelectItem key={unit.id.toString()} value={unit.abbreviation}>
                                        {unit.name} ({unit.abbreviation})
                                      </SelectItem>
                                    ))}
                                    {/* "Nueva unidad" option at the end */}
                                    <SelectItem
                                      key="new-unit"
                                      value="nueva-unidad"
                                      className="border-t border-coffee-200 pt-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-coffee-400" />
                                        <span>Nueva unidad...</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                
                                {/* Inline new unit form (shown when "Nueva unidad" is selected) */}
                                {selectedUnit === "nueva-unidad" && (
                                  <div className="mt-2 p-3 bg-coffee-50 rounded border border-coffee-200 space-y-2">
                                    <div className="space-y-2">
                                      <Label>Nombre *</Label>
                                      <Input
                                        value={newUnitName}
                                        onChange={(e) => setNewUnitName(e.target.value)}
                                        placeholder="Ej: Unidad, Libra, Paquete"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Abreviatura *</Label>
                                      <Input
                                        value={newUnitAbbreviation}
                                        onChange={(e) => setNewUnitAbbreviation(e.target.value)}
                                        placeholder="Ej: unid, lb, pqte"
                                        required
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSelectedUnit(units[0]?.abbreviation ?? "unid")}
                                        className="flex-1 text-sm"
                                        disabled={createUnitMutation.isPending}
                                      >
                                        Cancelar
                                      </Button>
                                      <Button
                                        type="button"
                                        onClick={handleCreateUnit}
                                        disabled={createUnitMutation.isPending}
                                        className="bg-caramel hover:bg-caramel/90 text-coffee-900"
                                      >
                                        {createUnitMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : null}
                                        Crear
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                
                        {/* Unit Cost */}
        <Card>
          <CardHeader>
            <CardTitle>Costo Unitario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="unitCost">
                Costo unitario *
                <p className="text-xs text-coffee-500 mt-1">
                  Precio de compra por {selectedUnitObj?.name ?? selectedUnit}, unidad, paquete u otra unidad de medida seleccionada.
                </p>
              </Label>
              <Input
                id="unitCost"
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Unit Sale Price */}
        <Card>
          <CardHeader>
            <CardTitle>Precio de Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="unitSalePrice">Precio de venta *</Label>
              <Input
                id="unitSalePrice"
                type="number"
                value={unitSalePrice}
                onChange={(e) => setUnitSalePrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Calculated Fields */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Ganancia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {profitMargin !== null ? (
                  <span className="text-2xl font-bold text-caramel">{profitMargin}%</span>
                ) : (
                  <span className="text-coffee-400">--</span>
                )}
                <p className="text-sm text-coffee-500 mt-1">
                  Fórmula: [(Precio venta / Precio compra) × 100] - 100
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Costo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {totalCost !== null ? (
                  <span className="text-2xl font-bold text-coffee-900">$${totalCost}</span>
                ) : (
                  <span className="text-coffee-400">--</span>
                )}
                <p className="text-sm text-coffee-500 mt-1">
                  Costo unitario × Cantidad
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entry Date */}
        <Card>
          <CardHeader>
            <CardTitle>Fecha de Entrada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !entryDate && "text-coffee-500")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {entryDate ? format(entryDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={entryDate}
                    onSelect={(date) => {
                      if (date) {
                        setEntryDate(date);
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              createEntryMutation.isPending ||
              !selectedProduct ||
              !quantity ||
              !selectedUnit ||
              !unitCost ||
              !unitSalePrice ||
              !entryDate
            }
            className="bg-caramel hover:bg-caramel/90 text-coffee-900"
          >
            {createEntryMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Entrada"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

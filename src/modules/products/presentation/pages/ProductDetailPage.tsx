import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Package,
  Edit,
  Trash2,
  Image,
  DollarSign,
  Calendar,
  User,
  ArrowLeft,
  History,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { createDeps } from "@/app/providers/composition-root";
import { getProduct } from "@/modules/products/application/queries/get-product.query";
import { getCategories } from "@/modules/products/application/queries/get-categories.query";
import { getUnits } from "@/modules/products/application/queries/get-units.query";
import { getPriceHistory } from "@/modules/products/application/queries/get-price-history.query";
import { getMerchandiseEntries } from "@/modules/warehouse/application/queries/get-merchandise-entries.query";
import { changePrice } from "@/modules/products/application/commands/change-price.command";
import { setPhoto } from "@/modules/products/application/commands/set-photo.command";
import { updateProduct } from "@/modules/products/application/commands/update-product.command";
import { deleteProduct } from "@/modules/products/application/commands/delete-product.command";
import { Product } from "@/modules/products/domain/entities/product";
import { Category } from "@/modules/products/domain/entities/category";
import { Unit } from "@/modules/products/domain/entities/unit";
import { PriceHistory } from "@/modules/products/domain/entities/price-history";
import { MerchandiseEntry } from "@/modules/warehouse/domain/entities/merchandise-entry";
import { ID } from "@/shared/types";

const deps = createDeps();

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct({ id: id! }, { productRepo: deps.productRepo }),
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ categoryRepo: deps.categoryRepo }),
  });

  const { data: unitsData } = useQuery({
    queryKey: ["units"],
    queryFn: () => getUnits({ unitRepo: deps.unitRepo }),
  });

  const { data: priceHistoryData, isLoading: priceHistoryLoading } = useQuery({
    queryKey: ["price-history", id],
    queryFn: () => getPriceHistory({ productId: id! }, { priceHistoryRepo: deps.priceHistoryRepo }),
    enabled: !!id,
  });

  const { data: entriesData, isLoading: entriesLoading } = useQuery({
    queryKey: ["merchandise-entries", id],
    queryFn: () => getMerchandiseEntries({ productId: id! }, { entryRepo: deps.merchandiseEntryRepo }),
    enabled: !!id,
  });

  const changePriceMutation = useMutation({
    mutationFn: (command: { productId: ID; priceType: "compra" | "venta"; newPrice: number }) =>
      changePrice(command, { productRepo: deps.productRepo, priceHistoryRepo: deps.priceHistoryRepo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["price-history", id] });
    },
  });

  const photoMutation = useMutation({
    mutationFn: (command: { productId: ID; file: File }) =>
      uploadPhoto(command.productId, command.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      setPhotoFile(null);
      setPhotoPreview(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (command: any) =>
      updateProduct(command, { productRepo: deps.productRepo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      setIsEditDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct({ id }, { productRepo: deps.productRepo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/productos");
    },
  });

  const product = productData?.product ?? null;
  const categories = categoriesData?.categories ?? [];
  const units = unitsData?.units ?? [];
  const priceHistory = priceHistoryData?.history ?? [];
  const entries = entriesData?.entries ?? [];

  const uploadPhoto = async (productId: ID, file: File): Promise<void> => {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    await setPhoto(
      {
        productId,
        fileName: file.name,
        contentType: file.type,
        data,
      },
      { productRepo: deps.productRepo, photoStorage: deps.photoStorage }
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile || !product) return;
    await photoMutation.mutateAsync({ productId: product.id, file: photoFile });
  };

  const handlePriceChange = async (priceType: "compra" | "venta", newPrice: number) => {
    if (!product) return;
    await changePriceMutation.mutateAsync({ productId: product.id, priceType, newPrice });
  };

  const handleDelete = () => {
    if (!product) return;
    if (window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      deleteMutation.mutate(product.id.toString());
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const command = {
      id: product.id.toString(),
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      unit: formData.get("unit") as string,
      categoryId: formData.get("categoryId") as string,
      currentPurchasePrice: Number(formData.get("currentPurchasePrice")),
      currentSalePrice: Number(formData.get("currentSalePrice")),
      minStock: Number(formData.get("minStock")),
      isActive: formData.get("isActive") === "true",
    };
    await updateMutation.mutateAsync(command);
    if (photoFile) {
      await handlePhotoUpload();
    }
  };

  if (productLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Producto" description="Cargando..." />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-coffee-100/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <PageHeader title="Producto no encontrado" description="El producto solicitado no existe." />
        <Button onClick={() => navigate("/productos")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a productos
        </Button>
      </div>
    );
  }

  const category = categories.find((c) => c.id.toString() === product.categoryId.toString());
  const profitMargin = product.getProfitMargin();
  const profitAmount = product.getProfitAmount();
  const isLowStock = product.isLowStock();

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={product.description || "Sin descripción"}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/productos")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Product Info Card */}
        <Card className="md:col-span-1 border-coffee-200">
          <CardHeader>
            <CardTitle className="text-coffee-900">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {product.photoUrl ? (
                <img
                  src={product.photoUrl}
                  alt={product.name}
                  className="h-32 w-32 rounded-lg object-cover border border-coffee-200"
                />
              ) : (
                <div className="h-32 w-32 rounded-lg bg-coffee-100 flex items-center justify-center">
                  <Package className="h-12 w-12 text-coffee-400" />
                </div>
              )}
            </div>
            <div className="space-y-2 text-center">
              <Badge className={product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {product.isActive ? "Activo" : "Inactivo"}
              </Badge>
              {isLowStock && (
                <Badge variant="destructive" className="ml-2">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Stock bajo
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2 border-coffee-200">
          <CardHeader>
            <CardTitle className="text-coffee-900">Detalles del producto</CardTitle>
            <CardDescription>Información completa del producto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <Label className="text-coffee-600 text-xs">Categoría</Label>
                  <p className="font-medium text-coffee-900">{category?.name || "Sin categoría"}</p>
                </div>
                <div>
                  <Label className="text-coffee-600 text-xs">Unidad</Label>
                  <p className="font-medium text-coffee-900">{product.unit}</p>
                </div>
                <div>
                  <Label className="text-coffee-600 text-xs">ID del producto</Label>
                  <p className="font-medium text-coffee-900">{product.id.toString()}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-coffee-600 text-xs">Precio compra</Label>
                  <p className="font-medium text-coffee-900">${product.currentPurchasePrice.toNumber().toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-coffee-600 text-xs">Precio venta</Label>
                  <p className="font-medium text-coffee-900">${product.currentSalePrice.toNumber().toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-coffee-600 text-xs">% Ganancia</Label>
                  <p className="font-medium text-coffee-900">
                    {product.currentPurchasePrice.toNumber() > 0
                      ? `${profitMargin.percentage.toNumber().toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Card */}
        <Card className="border-coffee-200">
          <CardHeader>
            <CardTitle className="text-coffee-900">Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-coffee-900">{product.currentStock.toNumber()}</p>
              <p className="text-sm text-coffee-600">{product.unit}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-coffee-600">Stock mínimo</span>
                <span className="font-medium text-coffee-900">{product.minStock.toNumber()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-600">Estado</span>
                <span className={isLowStock ? "text-red-600 font-medium" : "text-green-700 font-medium"}>
                  {isLowStock ? "Bajo" : "Suficiente"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Change Card */}
        <Card className="md:col-span-2 border-coffee-200">
          <CardHeader>
            <CardTitle className="text-coffee-900">Cambiar precios</CardTitle>
            <CardDescription>Actualiza los precios de compra y venta del producto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Precio compra</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product.currentPurchasePrice.toNumber().toFixed(2)}
                    className="pl-10 border-coffee-200 focus:border-caramel"
                    onBlur={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 0 && value !== product.currentPurchasePrice.toNumber()) {
                        handlePriceChange("compra", value);
                      }
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Precio venta</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product.currentSalePrice.toNumber().toFixed(2)}
                    className="pl-10 border-coffee-200 focus:border-caramel"
                    onBlur={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 0 && value !== product.currentSalePrice.toNumber()) {
                        handlePriceChange("venta", value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            {changePriceMutation.isPending && (
              <div className="mt-3 flex items-center gap-2 text-sm text-coffee-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando precios...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Upload Card */}
        <Card className="md:col-span-1 border-coffee-200">
          <CardHeader>
            <CardTitle className="text-coffee-900">Fotografía</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-24 w-24 rounded-lg object-cover border border-coffee-200"
                />
              ) : product.photoUrl ? (
                <img
                  src={product.photoUrl}
                  alt={product.name}
                  className="h-24 w-24 rounded-lg object-cover border border-coffee-200"
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-coffee-100 flex items-center justify-center">
                  <Image className="h-8 w-8 text-coffee-400" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("photo")?.click()}
                className="border-coffee-200 hover:border-caramel"
              >
                <Image className="h-4 w-4 mr-2" />
                {photoFile ? "Cambiar foto" : "Seleccionar foto"}
              </Button>
              {photoFile && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handlePhotoUpload}
                  disabled={photoMutation.isPending}
                  className="bg-caramel hover:bg-caramel/90 text-coffee-900"
                >
                  {photoMutation.isPending ? "Subiendo..." : "Guardar foto"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Price History Card */}
        <Card className="md:col-span-2 border-coffee-200">
          <CardHeader>
            <CardTitle className="text-coffee-900">Historial de precios</CardTitle>
            <CardDescription>Últimos cambios de precios del producto</CardDescription>
          </CardHeader>
          <CardContent>
            {priceHistoryLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-coffee-100/50 rounded animate-pulse" />
                ))}
              </div>
            ) : priceHistory.length === 0 ? (
              <p className="text-sm text-coffee-500">No hay historial de precios</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {priceHistory.slice(0, 10).map((h: PriceHistory) => (
                  <div key={h.id.toString()} className="flex items-center justify-between p-2 rounded-lg bg-coffee-50 border border-coffee-200">
                    <div className="flex items-center gap-3">
                      {h.priceType === "compra" ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <span className="font-medium text-coffee-900 capitalize">
                          {h.priceType === "compra" ? "Compra" : "Venta"}
                        </span>
                        <div className="text-xs text-coffee-600">
                          {h.oldPrice !== null
                            ? `De $${h.oldPrice.toNumber().toFixed(2)} → $${h.newPrice.toNumber().toFixed(2)}`
                            : `Nuevo: $${h.newPrice.toNumber().toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-coffee-600">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(h.changeDate.toISOString()).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Merchandise Entries Card */}
        <Card className="md:col-span-2 border-coffee-200">
          <CardHeader>
            <CardTitle className="text-coffee-900">Entradas de mercancía</CardTitle>
            <CardDescription>Historial de compras del producto</CardDescription>
          </CardHeader>
          <CardContent>
            {entriesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-coffee-100/50 rounded animate-pulse" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-sm text-coffee-500">No hay entradas de mercancía</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-coffee-50">
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Costo unit.</TableHead>
                      <TableHead className="text-right">Precio venta</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Proveedor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry: MerchandiseEntry) => (
                      <TableRow key={entry.id.toString()}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-coffee-500" />
                            {new Date(entry.entryDate.toISOString()).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.quantity.toNumber()} {product.unit}
                        </TableCell>
                        <TableCell className="text-right text-coffee-700">
                          ${entry.unitCost.toNumber().toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-coffee-700">
                          ${entry.unitSalePrice.toNumber().toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-coffee-900">
                          ${entry.totalCost.toNumber().toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {entry.supplier ? (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-coffee-500" />
                              {entry.supplier}
                            </div>
                          ) : (
                            <span className="text-coffee-400">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>Modifica los datos del producto</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={product.name}
                  placeholder="Nombre del producto"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría *</Label>
                <Select name="categoryId" defaultValue={product.categoryId.toString()} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: Category) => (
                      <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                name="description"
                defaultValue={product.description ?? ""}
                placeholder="Descripción del producto"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unidad *</Label>
                <Select name="unit" defaultValue={product.unit} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit: Unit) => (
                      <SelectItem key={unit.id.toString()} value={unit.name}>
                        {unit.name} ({unit.abbreviation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentPurchasePrice">Precio compra *</Label>
                <Input
                  id="currentPurchasePrice"
                  name="currentPurchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.currentPurchasePrice.toNumber().toFixed(2)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentSalePrice">Precio venta *</Label>
                <Input
                  id="currentSalePrice"
                  name="currentSalePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.currentSalePrice.toNumber().toFixed(2)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minStock">Stock mínimo</Label>
                <Input
                  id="minStock"
                  name="minStock"
                  type="number"
                  defaultValue={product.minStock.toNumber()}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Estado</Label>
                <Select name="isActive" defaultValue={product.isActive ? "true" : "false"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Fotografía</Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="sr-only"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("photo")?.click()}
                  className="border-coffee-200 hover:border-caramel"
                >
                  <Image className="h-4 w-4 mr-2" />
                  {photoFile ? "Cambiar foto" : "Seleccionar foto"}
                </Button>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-12 w-12 rounded-lg object-cover border border-coffee-200"
                  />
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-caramel hover:bg-caramel/90 text-coffee-900"
              >
                {updateMutation.isPending ? "Guardando..." : "Actualizar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

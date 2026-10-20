import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { Button } from "@/shared/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { Plus, Edit, Trash2, Search, Package, Image, DollarSign, Loader2, ExternalLink } from "lucide-react";
import { createDeps } from "@/app/providers/composition-root";
import { getProducts } from "@/modules/products/application/queries/get-products.query";
import { getCategories } from "@/modules/products/application/queries/get-categories.query";
import { getUnits } from "@/modules/products/application/queries/get-units.query";
import { createProduct } from "@/modules/products/application/commands/create-product.command";
import { updateProduct } from "@/modules/products/application/commands/update-product.command";
import { deleteProduct } from "@/modules/products/application/commands/delete-product.command";
import { changePrice } from "@/modules/products/application/commands/change-price.command";
import { setPhoto } from "@/modules/products/application/commands/set-photo.command";
import { Product } from "@/modules/products/domain/entities/product";
import { Category } from "@/modules/products/domain/entities/category";
import { Unit } from "@/modules/products/domain/entities/unit";
import { ID } from "@/shared/types";

const deps = createDeps();

export function ProductsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({}, { productRepo: deps.productRepo }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ categoryRepo: deps.categoryRepo }),
  });

  const { data: unitsData } = useQuery({
    queryKey: ["units"],
    queryFn: () => getUnits({ unitRepo: deps.unitRepo }),
  });

  const createMutation = useMutation({
    mutationFn: (command: any) => createProduct(command, { productRepo: deps.productRepo, categoryRepo: deps.categoryRepo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (command: any) => updateProduct(command, { productRepo: deps.productRepo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct({ id }, { productRepo: deps.productRepo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const changePriceMutation = useMutation({
    mutationFn: (command: { productId: ID; priceType: "compra" | "venta"; newPrice: number }) =>
      changePrice(command, { productRepo: deps.productRepo, priceHistoryRepo: deps.priceHistoryRepo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const photoMutation = useMutation({
    mutationFn: (command: { productId: ID; file: File }) =>
      uploadPhoto(command.productId, command.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setPhotoFile(null);
      setPhotoPreview(null);
    },
  });

  const products = productsData?.products ?? [];
  const categories = categoriesData?.categories ?? [];
  const units = unitsData?.units ?? [];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
    if (product.photoUrl) {
      setPhotoPreview(product.photoUrl);
    }
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      deleteMutation.mutate(product.id.toString());
    }
  };

  const handleDialogClose = () => {
    setEditingProduct(null);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async (productId: ID) => {
    if (!photoFile) return;
    await photoMutation.mutateAsync({ productId, file: photoFile });
  };

  const handlePriceChange = async (productId: ID, priceType: "compra" | "venta", newPrice: number) => {
    await changePriceMutation.mutateAsync({ productId, priceType, newPrice });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const command = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      unit: formData.get("unit") as string,
      categoryId: formData.get("categoryId") as string,
      currentPurchasePrice: Number(formData.get("currentPurchasePrice")),
      currentSalePrice: Number(formData.get("currentSalePrice")),
      minStock: Number(formData.get("minStock")),
      isActive: formData.get("isActive") === "true",
    };

    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id.toString(), ...command });
      if (photoFile) {
        await handlePhotoUpload(editingProduct.id);
      }
    } else {
      const result = await createMutation.mutateAsync(command);
      if (photoFile && result.product) {
        await handlePhotoUpload(result.product.id);
      }
    }
  };

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catálogo de productos, categorías, unidades de medida y precios actuales."
        actions={
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-caramel hover:bg-caramel/90 text-coffee-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo producto
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
        <Input
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-coffee-200 focus:border-caramel"
        />
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
                <TableHead>Categoría</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="text-right">Precio compra</TableHead>
                <TableHead className="text-right">Precio venta</TableHead>
                <TableHead className="text-right">% Ganancia</TableHead>
                <TableHead className="text-right">Ganancia/unidad</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-coffee-500">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const category = categories.find((c) => c.id.toString() === product.categoryId.toString());
                  const isLowStock = product.isLowStock();
                  const profitMargin = product.getProfitMargin();
                  const profitAmount = product.getProfitAmount();
                  return (
                    <TableRow key={product.id.toString()} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.photoUrl ? (
                            <img
                              src={product.photoUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-coffee-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-coffee-400" />
                            </div>
                          )}
                          <div>
                            <a
                              href={`/productos/${product.id}`}
                              className="font-medium text-coffee-900 hover:text-caramel transition-colors"
                            >
                              {product.name}
                            </a>
                            {product.description && (
                              <div className="text-sm text-coffee-500">{product.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {category ? (
                          <Badge variant="secondary" className="bg-coffee-100 text-coffee-800">
                            {category.name}
                          </Badge>
                        ) : (
                          <span className="text-coffee-400">Sin categoría</span>
                        )}
                      </TableCell>
                      <TableCell className="text-coffee-700">{product.unit}</TableCell>
                      <TableCell className="text-right text-coffee-700">
                        ${product.currentPurchasePrice.toNumber().toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-coffee-700">
                        ${product.currentSalePrice.toNumber().toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-coffee-700">
                        {product.currentPurchasePrice.toNumber() > 0
                          ? `${profitMargin.percentage.toNumber().toFixed(1)}%`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right text-coffee-700">
                        ${profitAmount.toNumber().toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={isLowStock ? "text-red-600 font-medium" : "text-coffee-700"}>
                          {product.currentStock.toNumber()}
                        </span>
                        {isLowStock && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Bajo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(product)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductFormDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        product={editingProduct}
        categories={categories}
        units={units}
        photoPreview={photoPreview}
        onPhotoChange={handlePhotoChange}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onPriceChange={handlePriceChange}
      />
    </div>
  );
}

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  units: Unit[];
  photoPreview: string | null;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  onPriceChange: (productId: ID, priceType: "compra" | "venta", newPrice: number) => Promise<void>;
}

function ProductFormDialog({
  open,
  onClose,
  product,
  categories,
  units,
  photoPreview,
  onPhotoChange,
  onSubmit,
  isSubmitting,
  onPriceChange,
}: ProductFormDialogProps) {
  const isEditing = !!product;
  const [purchasePrice, setPurchasePrice] = useState(product?.currentPurchasePrice.toNumber() ?? 0);
  const [salePrice, setSalePrice] = useState(product?.currentSalePrice.toNumber() ?? 0);

  const handlePurchasePriceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setPurchasePrice(value);
    if (isEditing && product) {
      await onPriceChange(product.id, "compra", value);
    }
  };

  const handleSalePriceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setSalePrice(value);
    if (isEditing && product) {
      await onPriceChange(product.id, "venta", value);
    }
  };

  const profitMargin = purchasePrice > 0 ? ((salePrice / purchasePrice) * 100 - 100) : null;
  const profitAmount = salePrice - purchasePrice;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del producto"
              : "Completa los datos para crear un nuevo producto"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoría *</Label>
              <Select name="categoryId" defaultValue={product?.categoryId.toString()} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
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
              defaultValue={product?.description ?? ""}
              placeholder="Descripción del producto"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unidad *</Label>
              <Select name="unit" defaultValue={product?.unit} required>
                <SelectTrigger>
                  <SelectValue placeholder="Unidad" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
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
                value={purchasePrice}
                onChange={handlePurchasePriceChange}
                placeholder="0.00"
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
                value={salePrice}
                onChange={handleSalePriceChange}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {isEditing && (
            <div className="rounded-lg bg-coffee-50 p-4 border border-coffee-200">
              <div className="flex items-center gap-2 text-sm text-coffee-700 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Cálculo de ganancia</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-coffee-600">% Ganancia: </span>
                  <span className="font-medium text-coffee-900">
                    {profitMargin !== null ? `${profitMargin.toFixed(1)}%` : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-coffee-600">Ganancia/unidad: </span>
                  <span className="font-medium text-coffee-900">${profitAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="photo">Fotografía</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={onPhotoChange}
                  className="sr-only"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("photo")?.click()}
                  className="bg-white border-coffee-200 hover:border-caramel"
                >
                  <Image className="h-4 w-4 mr-2" />
                  {photoFile ? "Cambiar foto" : "Subir foto"}
                </Button>
              </div>
              {photoPreview && (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-lg object-cover border border-coffee-200"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock mínimo</Label>
              <Input
                id="minStock"
                name="minStock"
                type="number"
                defaultValue={product?.minStock.toNumber() ?? 0}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isActive">Estado</Label>
              <Select name="isActive" defaultValue={product?.isActive ? "true" : "true"}>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-caramel hover:bg-caramel/90 text-coffee-900"
            >
              {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
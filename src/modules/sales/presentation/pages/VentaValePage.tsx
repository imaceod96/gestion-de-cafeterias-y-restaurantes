"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { ProductThumbnail } from "@/shared/ui/product-thumbnail";
import { createDeps } from "@/app/providers/composition-root";
import { getProducts } from "@/modules/products/application/queries/get-products.query";
import { createSale } from "@/modules/sales/application/commands/create-sale.command";
import { showSuccess, showError } from "@/shared/lib/toast";
import { ShoppingCart, Plus, Minus, Trash2, Receipt, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const deps = createDeps();

interface CartItem {
  productId: string;
  productName: string;
  photoUrl: string | null;
  unit: string;
  unitSalePrice: number;
  unitCost: number;
  quantity: number;
  total: number;
}

export default function VentaValePage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products-for-sale"],
    queryFn: () => getProducts({ activeOnly: true }, { productRepo: deps.productRepo }),
  });

  const products = productsData?.products ?? [];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createSaleMutation = useMutation({
    mutationFn: (items: CartItem[]) =>
      createSale(
        {
          origin: "vale",
          originId: null,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
        {
          saleRepo: deps.saleRepo,
          voucherRepo: deps.voucherRepo,
          productRepo: deps.productRepo,
          movementRepo: deps.movementRepo,
        }
      ),
    onSuccess: (result) => {
      if (result.success) {
        showSuccess(`Vale ${result.voucher?.code} creado correctamente`);
        setCart([]);
        queryClient.invalidateQueries({ queryKey: ["products-for-sale"] });
        queryClient.invalidateQueries({ queryKey: ["voucher-history"] });
      } else {
        showError(result.error || "No se pudo crear el vale");
      }
    },
    onError: () => {
      showError("Error de conexión");
    },
  });

  const addToCart = (product: any) => {
    const currentStock = product.currentStock.toNumber();
    if (currentStock <= 0) {
      showError("El producto está agotado");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id.toString());
      if (existing) {
        if (existing.quantity >= currentStock) {
          showError("Stock insuficiente");
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id.toString()
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitSalePrice }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id.toString(),
          productName: product.name,
          photoUrl: product.photoUrl,
          unit: product.unit,
          unitSalePrice: product.currentSalePrice.toNumber(),
          unitCost: product.currentPurchasePrice.toNumber(),
          quantity: 1,
          total: product.currentSalePrice.toNumber(),
        },
      ];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    const product = products.find((p) => p.id.toString() === productId);
    if (product && newQuantity > product.currentStock.toNumber()) {
      showError("Stock insuficiente");
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.unitSalePrice }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const canDispatch = cart.length > 0 && !createSaleMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="NUEVA COMPRA"
        description="Venta inmediata: selecciona productos, cantidad y despacha."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRODUCTOS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Input
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-coffee-200 focus:border-caramel"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-coffee-200 p-4 animate-pulse">
                  <div className="h-20 bg-coffee-100 rounded mb-2" />
                  <div className="h-4 bg-coffee-100 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-coffee-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-coffee-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const stock = product.currentStock.toNumber();
                const isOutOfStock = stock <= 0;
                return (
                  <button
                    key={product.id.toString()}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock || createSaleMutation.isPending}
                    className={`relative bg-white rounded-lg border p-4 transition-all hover:shadow-md ${
                      isOutOfStock
                        ? "border-red-200 bg-red-50 opacity-60 cursor-not-allowed"
                        : "border-coffee-200 hover:border-caramel"
                    }`}
                  >
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-red-50/80 rounded-lg flex items-center justify-center z-10">
                        <Badge variant="destructive" className="text-sm">
                          AGOTADO
                        </Badge>
                      </div>
                    )}
                    <div className="relative z-10 space-y-2">
                      <ProductThumbnail
                        photoUrl={product.photoUrl}
                        name={product.name}
                        unit={product.unit}
                        size="md"
                        className="w-full justify-center"
                      />
                      <div className="text-center">
                        <p className="font-medium text-coffee-900 truncate">{product.name}</p>
                        <p className="text-sm text-coffee-700">
                          ${product.currentSalePrice.toNumber().toFixed(2)}
                        </p>
                        <p className="text-xs text-coffee-500">Stock: {stock}</p>
                      </div>
                    </div>
                    {!isOutOfStock && (
                      <div className="absolute bottom-2 right-2 z-10">
                        <Plus className="h-5 w-5 text-caramel" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* COMPRA ACTUAL */}
        <div className="bg-white rounded-xl border border-coffee-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-coffee-900 flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            COMPRA ACTUAL
          </h2>

          <Separator />

          {cart.length === 0 ? (
            <div className="text-center py-12 text-coffee-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay productos en la compra</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-3 bg-coffee-50 rounded-lg border border-coffee-100"
                >
                  <ProductThumbnail
                    photoUrl={item.photoUrl}
                    name={item.productName}
                    unit={item.unit}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-coffee-900 truncate">{item.productName}</p>
                    <p className="text-sm text-coffee-600">
                      ${item.unitSalePrice.toFixed(2)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={createSaleMutation.isPending}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-medium text-coffee-900">
                      {item.quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={createSaleMutation.isPending}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromCart(item.productId)}
                      disabled={createSaleMutation.isPending}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right w-24">
                    <p className="font-semibold text-coffee-900">
                      ${item.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-coffee-700">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-coffee-900 border-t border-coffee-200 pt-2">
              <span>TOTAL</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full py-4 text-lg"
            onClick={() => createSaleMutation.mutate(cart)}
            disabled={!canDispatch}
          >
            {createSaleMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Despachando...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                DESPACHAR
              </>
            )}
          </Button>

          {cart.length === 0 && (
            <p className="text-center text-xs text-coffee-500">
              Agrega productos para habilitar el despacho
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
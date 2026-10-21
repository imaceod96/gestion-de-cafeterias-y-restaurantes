"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { ProductThumbnail } from "@/shared/ui/product-thumbnail";
import { createDeps } from "@/app/providers/composition-root";
import { getTableAccount } from "@/modules/tables/application/queries/get-table-account.query";
import { getProducts } from "@/modules/products/application/queries/get-products.query";
import { addTableDetail } from "@/modules/tables/application/commands/add-table-detail.command";
import { updateTableDetail } from "@/modules/tables/application/commands/update-table-detail.command";
import { closeTable } from "@/modules/tables/application/commands/close-table.command";
import { showSuccess, showError } from "@/shared/lib/toast";
import { Plus, Minus, Trash2, UtensilsCrossed, Loader2, AlertCircle, CheckCircle, X, ChevronLeft } from "lucide-react";

const deps = createDeps();

interface CartItem {
  productId: string;
  productName: string;
  photoUrl: string | null;
  unit: string;
  unitSalePrice: number;
  quantity: number;
  total: number;
  detailId?: string;
}

export function TableAccountPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const accountId = params?.accountId ?? null;
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);

  // Load account when component mounts or accountId changes
  useEffect(() => {
    if (accountId) {
      const loadAccount = async () => {
        setIsLoadingAccount(true);
        const result = await getTableAccount(
          { accountId },
          { tableAccountRepo: deps.tableAccountRepo }
        );
        if (result.success && result.account) {
                  setAccount(result.account);
                  // Initialize cart from account details
                  setCart(
                    result.account.details.map((d: any) => ({
                      productId: d.productId,
                      productName: d.productName,
                      photoUrl: null,
                      unit: "un",
                      unitSalePrice: d.unitSalePrice,
                      quantity: d.quantity,
                      total: d.total,
                      detailId: d.id.toString(),
                    }))
                  );
                }
        setIsLoadingAccount(false);
              };
              loadAccount();
            }
          }, [accountId]);

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products-for-sale"],
    queryFn: () => getProducts({ activeOnly: true }, { productRepo: deps.productRepo }),
  });

  const products = productsData?.products ?? [];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCartMutation = useMutation({
        mutationFn: ({ productId: id, quantity }: { productId: string; quantity: number }) =>
          addTableDetail(
            {
              accountId: accountId ?? "",
              productId: id,
              quantity,
            },
            { tableAccountRepo: deps.tableAccountRepo, productRepo: deps.productRepo }
          ),
        onSuccess: (_result, variables) => {
          const id = variables?.productId;
          if (id && _result.success && _result.account) {
            setAccount(_result.account);
            setCart((prev) => {
              const existing = prev.find((item) => item.productId === id);
              if (existing) {
                return prev.map((item) =>
                  item.productId === id
                    ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitSalePrice }
                    : item
                );
              }
              // New item - add to cart with detailId from result
                            return [
                              ...prev,
                              {
                                productId: id,
                                productName: _result.detail?.productName ?? "",
                                photoUrl: null,
                                unit: "un",
                                unitSalePrice: _result.detail?.unitSalePrice?.toNumber() ?? 0,
                                quantity: _result.detail?.quantity?.toNumber() ?? 1,
                                total: _result.detail?.total?.toNumber() ?? 0,
                                detailId: _result.detail?.id.toString(),
                              },
                            ];
            });
            queryClient.invalidateQueries({ queryKey: ["open-tables"] });
          } else if (_result.error) {
            showError(_result.error || "No se pudo agregar el producto");
          }
        },
        onError: () => {
          showError("Error de conexión");
        },
      });
  
    const updateQuantityMutation = useMutation({
        mutationFn: ({ detailId, quantity }: { detailId: string; quantity: number }) =>
          updateTableDetail(
            { accountId: accountId ?? "", detailId, quantity },
            { tableAccountRepo: deps.tableAccountRepo, productRepo: deps.productRepo }
          ),
        onSuccess: (_result, variables) => {
          const detailId = variables?.detailId;
          if (detailId && _result.success && _result.account) {
            setAccount(_result.account);
            setCart((prev) =>
              prev.map((item) =>
                item.detailId === detailId
                  ? { ...item, quantity: _result.detail?.quantity?.toNumber() ?? item.quantity, total: _result.detail?.total?.toNumber() ?? item.total }
                  : item
              )
            );
            queryClient.invalidateQueries({ queryKey: ["open-tables"] });
          } else if (_result.error) {
            showError(_result.error || "No se pudo actualizar la cantidad");
          }
        },
        onError: () => {
          showError("Error de conexión");
        },
      });
  
    const closeMutation = useMutation({
      mutationFn: () =>
        closeTable(
          { accountId: accountId ?? "" },
          {
            tableAccountRepo: deps.tableAccountRepo,
            saleRepo: deps.saleRepo,
            voucherRepo: deps.voucherRepo,
            productRepo: deps.productRepo,
            movementRepo: deps.movementRepo,
          }
        ),
    onSuccess: (result) => {
      if (result.success) {
        showSuccess("Mesa cerrada correctamente");
        queryClient.invalidateQueries({ queryKey: ["open-tables"] });
        queryClient.invalidateQueries({ queryKey: ["voucher-history"] });
        queryClient.invalidateQueries({ queryKey: ["mesa-history"] });
        setAccount(null);
        setCart([]);
        navigate("/");
      } else {
        showError(result.error || "No se pudo cerrar la mesa");
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
    addToCartMutation.mutate({ productId: product.id.toString(), quantity: 1 });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.find((i) => i.productId === productId);
    if (!item || !item.detailId) return;
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
      updateQuantityMutation.mutate({ detailId: item.detailId, quantity: 0 });
      return;
    }
    const product = products.find((p) => p.id.toString() === productId);
    if (product && newQuantity > product.currentStock.toNumber()) {
      showError("Stock insuficiente");
      return;
    }
    updateQuantityMutation.mutate({ detailId: item.detailId, quantity: newQuantity });
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.productId === productId);
    if (!item || !item.detailId) return;
    setCart((prev) => prev.filter((i) => i.productId !== productId));
    updateQuantityMutation.mutate({ detailId: item.detailId, quantity: 0 });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const canClose = (account?.isOpen() ?? false) && cart.length > 0;

  if (!account) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cuenta de Mesa"
          description="Cargando cuenta de mesa..."
        />
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-coffee-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuenta de Mesa"
        description={`Mesa #${account.tableId} - ${account.isOpen() ? "Abierta" : "Cerrada"} ${account.total > 0 ? `- $${account.total.toFixed(2)}` : ""}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRODUCTOS DISPONIBLES */}
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
                    disabled={isOutOfStock || addToCartMutation.isPending}
                    className={`relative bg-white rounded-lg border p-4 transition-all hover:shadow-md ${
                      isOutOfStock
                        ? "border-red-200 bg-red-50 opacity-60 cursor-not-allowed"
                        : "border-coffee-200 hover:border-caramel"
                    }`}
                  >
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-red-50/80 rounded-lg flex items-center justify-center z-10">
                        <Badge variant="destructive" className="text-sm">AGOTADO</Badge>
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
            <UtensilsCrossed className="h-5 w-5" /> COMPRA ACTUAL
          </h2>

          <Separator />

          {isLoadingAccount ? (
            <div className="h-96 bg-coffee-100 rounded mb-4 animate-pulse" />
          ) : cart.length === 0 ? (
            <div className="text-center py-12 text-coffee-500">
              <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay productos en la cuenta</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {cart.map((item) => {
                return (
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
                        disabled={closeMutation.isPending}
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
                        disabled={closeMutation.isPending}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(item.productId)}
                        disabled={closeMutation.isPending}
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
                );
              })}
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
              <span>${account?.total.toFixed(2) ?? subtotal.toFixed(2)}</span>
            </div>
          </div>

          {account?.isOpen() ? (
            <>
              <Button
                className="w-full py-4 text-lg"
                onClick={() => closeMutation.mutate()}
                disabled={closeMutation.isPending || !account?.isOpen()}
              >
                {closeMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cerrando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" /> CERRAR MESA
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-coffee-500">
              <X className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">La mesa está cerrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TableAccountPage;
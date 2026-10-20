import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/shared/ui/layout/AppLayout";
import Index from "@/app/pages/Index";
import { NotFound } from "@/app/pages/NotFound";
import { ProductsPage } from "@/modules/products/presentation/pages/ProductsPage";
import { ProductDetailPage } from "@/modules/products/presentation/pages/ProductDetailPage";
import { IngresarMercanciaPage } from "@/modules/warehouse/presentation/pages/IngresarMercanciaPage";
import { ExistenciaActualPage } from "@/modules/inventory/presentation/pages/ExistenciaActualPage";
import { InventarioPage } from "@/modules/inventory/presentation/pages/InventarioPage";
import { VentaValePage } from "@/modules/sales/presentation/pages/VentaValePage";
import { MesasPage } from "@/modules/sales/presentation/pages/MesasPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/productos" element={<ProductsPage />} />
                        <Route path="/productos/:id" element={<ProductDetailPage />} />
                        <Route path="/almacen/ingresar-mercancia" element={<IngresarMercanciaPage />} />
            <Route path="/almacen/existencia-actual" element={<ExistenciaActualPage />} />
            <Route path="/almacen/inventario" element={<InventarioPage />} />
            <Route path="/ventas/vale" element={<VentaValePage />} />
            <Route path="/mesas" element={<MesasPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

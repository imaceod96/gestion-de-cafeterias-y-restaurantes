import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/shared/ui/layout/AppLayout";
import Index from "@/app/pages/Index";
import { NotFound } from "@/app/pages/NotFound";
import { ProductsPage } from "@/modules/products/presentation/pages/ProductsPage";
import { IngresarMercanciaPage } from "@/modules/warehouse/presentation/pages/IngresarMercanciaPage";
import { ExistenciaActualPage } from "@/modules/inventory/presentation/pages/ExistenciaActualPage";

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
            <Route path="/almacen/ingresar-mercancia" element={<IngresarMercanciaPage />} />
            <Route path="/almacen/existencia-actual" element={<ExistenciaActualPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, UtensilsCrossed } from "lucide-react";
import { OpenTablesGrid } from "@/modules/tables/presentation/components/OpenTablesGrid";
import { CreateTableDialog } from "@/modules/tables/presentation/components/CreateTableDialog";

export default function Index() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          type="button"
          onClick={() => navigate("/ventas/vale")}
          className="flex-1 bg-coffee-800 text-white py-4 px-6 rounded-lg font-medium hover:bg-coffee-900 transition-colors flex items-center justify-center gap-3"
        >
          <ShoppingCart className="w-6 h-6" />
          NUEVA COMPRA
        </button>
        <button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
          className="flex-1 bg-coffee-800 text-white py-4 px-6 rounded-lg font-medium hover:bg-coffee-900 transition-colors flex items-center justify-center gap-3"
        >
          <UtensilsCrossed className="w-6 h-6" />
          MESA
        </button>
      </div>

      <div className="bg-white rounded-xl border border-coffee-200 p-6">
        <OpenTablesGrid />
      </div>

      <CreateTableDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
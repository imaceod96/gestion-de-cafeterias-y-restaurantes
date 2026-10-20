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
import { Search, Receipt, Calendar, Package, AlertTriangle, Loader2 } from "lucide-react";
import { createDeps } from "@/app/providers/composition-root";
import { ProductThumbnail } from "@/shared/ui/product-thumbnail";

const deps = createDeps();

interface VoucherHistoryItem {
  id: string;
  code: string;
  status: string;
  total: number;
  saleId: string | null;
  createdBy: string | null;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  details?: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitSalePrice: number;
    unitCost: number;
    total: number;
    createdAt: string;
  }>;
}

export default function HistorialValesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["voucher-history"],
    queryFn: async (): Promise<VoucherHistoryItem[]> => {
      const res = await fetch("/api/vouchers/history");
      if (!res.ok) throw new Error("Error obteniendo historial de vales");
      return res.json();
    },
  });

  const items = data ?? [];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.code
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const groupedByDate = filteredItems.reduce<Record<string, VoucherHistoryItem[]>>(
    (acc, item) => {
      const date = new Date(item.closedAt || item.openedAt).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de Vales"
        description="Vales cerrados y registrados históricamente"
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-400" />
        <Input
          placeholder=" buscar vale por código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-coffee-200 focus:border-caramel"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-coffee-400" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-coffee-500">
          <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
          No hay vales en el historial
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-semibold text-coffee-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {date}
              </h3>
              <div className="rounded-lg border border-coffee-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-coffee-50">
                      <TableHead>Vale</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Creó</TableHead>
                      <TableHead>Detalles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedByDate[date].map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-coffee-500" />
                            <span className="font-medium text-coffee-900">
                              Vale #{item.code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              item.status === "cerrado"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-coffee-700">
                          {new Date(item.closedAt || item.openedAt).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell className="text-coffee-700">
                          {new Date(item.closedAt || item.openedAt).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium text-coffee-900">
                          ${item.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-coffee-700">
                          {item.createdBy || "—"}
                        </TableCell>
                        <TableCell>
                          {item.details && item.details.length > 0 ? (
                            <div className="space-y-1">
                              {item.details.map((d) => (
                                <div key={d.id} className="text-xs text-coffee-600">
                                  <ProductThumbnail
                                    photoUrl={null}
                                    name={d.productName}
                                    unit=""
                                    size="xs"
                                    className="text-xs"
                                  />
                                  <span className="ml-2">
                                    {d.quantity} x ${d.unitSalePrice.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-coffee-400 text-xs">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
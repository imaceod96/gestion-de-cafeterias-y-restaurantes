"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { createDeps } from "@/app/providers/composition-root";
import { openTable } from "@/modules/tables/application/commands/open-table.command";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/shared/lib/toast";

interface CreateTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTableDialog({ open, onOpenChange }: CreateTableDialogProps) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const deps = createDeps();

  const mutation = useMutation({
    mutationFn: () =>
      openTable(
        { number: Number(number), name: name.trim() },
        { tableRepo: deps.tableRepo, tableAccountRepo: deps.tableAccountRepo }
      ),
    onSuccess: (result) => {
      if (result.success && result.account) {
        showSuccess(`Mesa ${result.table?.number} abierta correctamente`);
        queryClient.invalidateQueries({ queryKey: ["open-tables"] });
        onOpenChange(false);
        setNumber("");
        setName("");
        navigate(`/mesa/${result.account.id.toString()}`);
      } else {
        showError(result.error || "No se pudo abrir la mesa");
      }
    },
    onError: () => {
      showError("Error de conexión");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number || !name.trim()) return;
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Abrir nueva mesa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="number" className="text-right">
                Número de mesa *
              </Label>
              <Input
                id="number"
                type="number"
                min="1"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="col-span-3"
                required
                disabled={mutation.isPending}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre de la persona *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Ej: María, Juan, Terraza..."
                required
                disabled={mutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending || !number || !name.trim()}>
              {mutation.isPending ? "Abriendo..." : "ABRIR MESA"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

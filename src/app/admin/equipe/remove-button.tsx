"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { removeAdmin } from "./actions";
import { Button } from "@/components/ui/button";

export function RemoveButton({ adminRowId }: { adminRowId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await removeAdmin(adminRowId);
      if (result.status === "error") {
        setError(result.message ?? "Não foi possível remover.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="ghost" size="sm" onClick={handleClick} loading={isPending}>
        <Trash2 className="h-3.5 w-3.5" /> Remover
      </Button>
      {error && (
        <span className="flex items-center gap-1 text-caption text-error">
          <AlertCircle className="h-3 w-3 shrink-0" /> {error}
        </span>
      )}
    </div>
  );
}

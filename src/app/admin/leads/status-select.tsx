"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus, type LeadStatus } from "./actions";
import { Select } from "@/components/ui/select";

const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  convertido: "Convertido",
  descartado: "Descartado",
};

export function StatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as LeadStatus;
    setValue(next);
    startTransition(async () => {
      await updateLeadStatus(leadId, next);
    });
  }

  return (
    <Select
      value={value}
      onChange={handleChange}
      disabled={isPending}
      className="h-9 py-0 text-body-sm"
      aria-label="Status do lead"
    >
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </Select>
  );
}

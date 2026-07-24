"use client";

import { useId } from "react";
import { MONTH_OPTIONS, type ResumePeriod } from "@/lib/resume-schema";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface PeriodFieldsProps {
  value: ResumePeriod;
  onChange: (period: ResumePeriod) => void;
}

export function PeriodFields({ value, onChange }: PeriodFieldsProps) {
  const atualId = useId();

  function update(patch: Partial<ResumePeriod>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex items-end gap-1.5">
        <Select
          aria-label="Mês de início"
          value={value.inicioMes}
          onChange={(e) => update({ inicioMes: e.target.value })}
          className="w-[4.5rem]"
        >
          <option value="">Mês</option>
          {MONTH_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
        <Input
          aria-label="Ano de início"
          placeholder="Ano"
          inputMode="numeric"
          maxLength={4}
          value={value.inicioAno}
          onChange={(e) => update({ inicioAno: e.target.value.replace(/\D/g, "").slice(0, 4) })}
          className="w-20"
        />
      </div>

      <span className="pb-2.5 text-body-sm text-fg-muted">até</span>

      <div className="flex items-end gap-1.5">
        <Select
          aria-label="Mês de término"
          value={value.fimMes}
          onChange={(e) => update({ fimMes: e.target.value })}
          disabled={value.atual}
          className="w-[4.5rem]"
        >
          <option value="">Mês</option>
          {MONTH_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
        <Input
          aria-label="Ano de término"
          placeholder="Ano"
          inputMode="numeric"
          maxLength={4}
          value={value.fimAno}
          onChange={(e) => update({ fimAno: e.target.value.replace(/\D/g, "").slice(0, 4) })}
          disabled={value.atual}
          className="w-20"
        />
      </div>

      <div className="pb-2.5">
        <Checkbox
          id={atualId}
          checked={value.atual}
          onChange={(e) =>
            update({ atual: e.target.checked, ...(e.target.checked ? { fimMes: "", fimAno: "" } : {}) })
          }
          label="Atual"
        />
      </div>
    </div>
  );
}

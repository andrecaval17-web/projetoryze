"use client";

import { useState, useTransition } from "react";
import { updateJobPostingStatus, type JobStatus } from "./actions";
import { Select } from "@/components/ui/select";

const STATUS_LABELS: Record<JobStatus, string> = {
  aberta: "Aberta",
  pausada: "Pausada",
  encerrada: "Encerrada",
};

export function JobStatusSelect({ jobId, status }: { jobId: string; status: JobStatus }) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as JobStatus;
    setValue(next);
    startTransition(async () => {
      await updateJobPostingStatus(jobId, next);
    });
  }

  return (
    <Select
      value={value}
      onChange={handleChange}
      disabled={isPending}
      className="h-9 py-0 text-body-sm"
      aria-label="Status da vaga"
    >
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </Select>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Archive } from "lucide-react";
import { archiveJobOpeningRequest } from "../actions";
import { Button } from "@/components/ui/button";

export function ArchiveButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Arquivar esta solicitação? Ela deixa de aparecer como pendente de revisão.")) return;
    startTransition(async () => {
      await archiveJobOpeningRequest(requestId);
      router.refresh();
    });
  }

  return (
    <Button type="button" variant="ghost" onClick={handleClick} loading={isPending}>
      <Archive className="h-4 w-4" />
      Arquivar
    </Button>
  );
}

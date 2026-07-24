"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import { inviteAdmin, type InviteState } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: InviteState = { status: "idle" };

export function InviteForm() {
  const [state, formAction, isPending] = useActionState(inviteAdmin, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <Input
          type="email"
          name="email"
          placeholder="email@exemplo.com"
          required
          key={state.status === "success" ? state.message : undefined}
        />
        {state.status === "error" && (
          <p className="mt-1.5 flex items-center gap-1.5 text-body-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" /> {state.message}
          </p>
        )}
        {state.status === "success" && (
          <p className="mt-1.5 flex items-center gap-1.5 text-body-sm text-accent-600 dark:text-accent-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {state.message}
          </p>
        )}
      </div>
      <Button type="submit" loading={isPending}>
        <UserPlus className="h-4 w-4" />
        Convidar admin
      </Button>
    </form>
  );
}

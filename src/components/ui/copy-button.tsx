"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button, type ButtonProps } from "./button";

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copiar", className, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleClick} className={className} {...props}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copiado!" : label}
    </Button>
  );
}

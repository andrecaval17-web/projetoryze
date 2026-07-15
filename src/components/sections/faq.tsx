import { Plus } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Objection-handling FAQ. Uses native <details>/<summary> so it works with
 * zero client JS and stays accessible/keyboard-friendly by default.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-lg border border-border bg-bg-surface px-5 py-4 [&_svg]:open:rotate-45"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body-md font-medium text-fg marker:content-['']">
            {item.question}
            <Plus className="h-5 w-5 shrink-0 text-accent-600 transition-ryze dark:text-accent-400" />
          </summary>
          <p className="mt-3 text-body-md text-fg-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

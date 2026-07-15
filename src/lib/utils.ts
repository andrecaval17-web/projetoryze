import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
  Our design tokens define custom font sizes under the `text-*` prefix
  (text-display-lg, text-body-md, text-label, …). Out of the box tailwind-merge
  can't distinguish those from text-color utilities (text-white, text-fg,
  text-paper) — both match `text-*` — so it treats a size and a color as
  conflicting and drops one, which silently stripped button/badge text colors.
  Registering the sizes in the `font-size` group keeps size and color separate.
*/
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-2xl",
            "display-xl",
            "display-lg",
            "display-md",
            "heading-lg",
            "heading-md",
            "heading-sm",
            "body-lg",
            "body-md",
            "body-sm",
            "label",
            "caption",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

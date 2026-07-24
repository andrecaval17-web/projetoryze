import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

// Componentes do markdown mapeados pros tokens do design system (não usa o
// plugin @tailwindcss/typography — o projeto não tem, e assim fica
// consistente com as classes já usadas no resto do site).
const components: Components = {
  h1: ({ children }) => (
    <h3 className="mb-2 mt-6 font-display text-heading-md font-semibold text-fg first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 mt-6 font-display text-heading-sm font-semibold text-fg first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-2 mt-5 font-display text-body-md font-semibold text-fg first:mt-0">{children}</h4>
  ),
  p: ({ children }) => <p className="mb-3 text-body-sm leading-relaxed text-fg last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
  em: ({ children }) => <em className="text-fg-muted">{children}</em>,
  ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1.5 text-body-sm text-fg last:mb-0">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mb-3 ml-5 list-decimal space-y-1.5 text-body-sm text-fg last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent-600 underline underline-offset-2 hover:text-accent-500 dark:text-accent-400"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-4 border-border" />,
  code: ({ children }) => (
    <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-caption text-fg">{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-accent-500/40 pl-4 text-fg-muted last:mb-0">
      {children}
    </blockquote>
  ),
};

export function AiMarkdown({ content }: { content: string }) {
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
}

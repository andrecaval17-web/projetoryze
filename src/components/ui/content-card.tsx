import Link from "next/link";
import Image from "next/image";
import { Badge } from "./badge";

interface ContentCardProps {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  href: string;
  imageSrc?: string;
}

export function ContentCard({ title, excerpt, category, date, href, imageSrc }: ContentCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-bg-surface transition-ryze hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg-surface-2">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover transition-ryze group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-ryze opacity-20" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2">
          <Badge variant="neutral">{category}</Badge>
          <span className="text-caption text-fg-muted">{date}</span>
        </div>
        <h3 className="font-display text-heading-sm font-semibold text-fg">{title}</h3>
        <p className="line-clamp-2 text-body-sm text-fg-muted">{excerpt}</p>
      </div>
    </Link>
  );
}

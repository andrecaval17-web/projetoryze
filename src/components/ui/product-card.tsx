import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Badge } from "./badge";
import { FoldCorner } from "@/components/brand/fold-corner";

interface ProductCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export function ProductCard({ icon: Icon, title, description, href }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden hover:-translate-y-0.5 hover:shadow-glow-md">
      <FoldCorner size="sm" />
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gradient-ryze text-white shadow-glow-sm">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <Badge variant="accent">IA</Badge>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-body-sm font-medium text-accent-600 transition-ryze hover:gap-1.5 dark:text-accent-400"
        >
          Ver produto
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

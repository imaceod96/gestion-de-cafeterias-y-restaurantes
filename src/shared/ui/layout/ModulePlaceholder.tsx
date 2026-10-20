import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { CheckCircle2 } from "lucide-react";

type ModulePlaceholderProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  plannedItems?: string[];
  className?: string;
};

export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
  plannedItems,
  className,
}: ModulePlaceholderProps) {
  return (
    <Card className={cn("surface-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-coffee-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coffee-100 text-caramel">
            <Icon className="h-5 w-5" />
          </div>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {plannedItems && plannedItems.length > 0 ? (
          <ul className="space-y-2">
            {plannedItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-caramel" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}

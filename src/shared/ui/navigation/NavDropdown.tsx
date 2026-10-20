import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export type NavDropdownItem = {
  label: string;
  to: string;
  description?: string;
  icon?: React.ElementType;
};

type NavDropdownProps = {
  label: string;
  items: NavDropdownItem[];
  className?: string;
  align?: "start" | "center" | "end";
};

export function NavDropdown({
  label,
  items,
  className,
  align = "start",
}: NavDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-coffee-200 transition-colors hover:bg-coffee-800 hover:text-white",
          className
        )}
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-64 rounded-xl border-border bg-card p-1.5 shadow-lg"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.to}
              asChild
              className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-coffee-100 focus:text-coffee-900"
            >
              <NavLink to={item.to} className="flex items-start gap-3">
                {Icon ? (
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-caramel" />
                ) : null}
                <span className="flex flex-col">
                  <span className="text-sm font-medium leading-none">
                    {item.label}
                  </span>
                  {item.description ? (
                    <span className="mt-1 text-xs leading-snug text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </NavLink>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";

interface NavDropdownItem {
  label: string;
  description: string;
  to: string;
  icon: any;
}

interface NavDropdownProps {
  label: string;
  icon: any;
  items: NavDropdownItem[];
}

export function NavDropdown({ label, icon: Icon, items }: NavDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-coffee-100 text-coffee-700 hover:text-coffee-900">
        <Icon className="w-5 h-5" />
        <span>{label}</span>
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <DropdownMenuItem key={item.label} asChild>
              <a href={item.to} className="flex items-center space-x-3 p-3">
                <ItemIcon className="w-5 h-5 text-coffee-600" />
                <div>
                  <div className="font-medium text-coffee-900">{item.label}</div>
                  <div className="text-sm text-coffee-600">{item.description}</div>
                </div>
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
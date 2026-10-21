import { APP_NAME, APP_TAGLINE, sidebarNavigation } from "@/app/config/navigation";
import { Coffee, Receipt, UtensilsCrossed, Warehouse, Boxes, PackagePlus, ScanLine, ClipboardList, LayoutGrid, History } from "lucide-react";
import { NavDropdown } from "@/shared/ui/navigation/NavDropdown";
import { ProductAvailabilityMenu } from "@/app/components/ProductAvailabilityMenu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/shared/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-coffee-50 to-cream-50">
      <Sidebar collapsible="none" className="w-64 shrink-0 border-r border-coffee-200 bg-white">
        <SidebarHeader className="p-4 border-b border-coffee-200">
          <div className="w-10 h-10 bg-coffee-800 rounded-lg flex items-center justify-center mb-3">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-coffee-900">{APP_NAME}</h1>
          <p className="text-sm text-coffee-600">{APP_TAGLINE}</p>
        </SidebarHeader>

        <SidebarContent className="flex-1 overflow-y-auto p-2">
          <SidebarMenu>
            {sidebarNavigation.map((item) => {
              if (item.items) {
                return (
                  <SidebarMenuItem key={item.key}>
                    <NavDropdown
                      label={item.label}
                      icon={item.icon}
                      items={item.items}
                    />
                  </SidebarMenuItem>
                );
              }
              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <a href={item.to} className="flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-coffee-100 text-coffee-700 hover:text-coffee-900">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-coffee-200">
          <ProductAvailabilityMenu />
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 min-w-0 bg-coffee-50">
        {children}
      </main>
    </div>
  );
}
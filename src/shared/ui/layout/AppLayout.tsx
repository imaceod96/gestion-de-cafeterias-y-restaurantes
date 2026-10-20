import { APP_NAME, APP_TAGLINE, primaryActions, administrativeNavigation, salesNavigation, historyNavigation } from "@/app/config/navigation";
import { Coffee, Receipt, UtensilsCrossed, Warehouse, Boxes, PackagePlus, ScanLine, ClipboardList, LayoutGrid, History } from "lucide-react";
import { NavDropdown } from "@/shared/ui/navigation/NavDropdown";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-coffee-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-coffee-800 rounded-lg flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-coffee-900">{APP_NAME}</h1>
                <p className="text-sm text-coffee-600">{APP_TAGLINE}</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              {primaryActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a
                    key={action.key}
                    href={action.to}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-coffee-100 text-coffee-700 hover:text-coffee-900"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{action.label}</span>
                  </a>
                );
              })}

              <NavDropdown
                label="ALMACÉN"
                icon={Warehouse}
                items={administrativeNavigation[0].items}
              />

              <NavDropdown
                label="CATÁLOGO"
                icon={Coffee}
                items={administrativeNavigation[1].items}
              />

              <NavDropdown
                label="CORTES"
                icon={LayoutGrid}
                items={administrativeNavigation[2].items}
              />

              <NavDropdown
                label="VALES"
                icon={Receipt}
                items={salesNavigation[0].items}
              />

              <NavDropdown
                label="MESAS"
                icon={UtensilsCrossed}
                items={salesNavigation[1].items}
              />

              <NavDropdown
                label="HISTORIAL"
                icon={History}
                items={historyNavigation[0].items}
              />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
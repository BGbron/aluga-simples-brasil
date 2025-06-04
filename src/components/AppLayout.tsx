
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Building, Users, Calendar, Menu, X, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message || "Erro ao fazer logout.",
      });
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Imóveis", href: "/imoveis", icon: Building },
    { name: "Inquilinos", href: "/inquilinos", icon: Users },
    { name: "Pagamentos", href: "/pagamentos", icon: Calendar },
  ];

  const isActiveRoute = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-primary text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-6">
            <Link to="/" className="text-2xl font-bold">Aluga Simples</Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-white lg:hidden"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActiveRoute(item.href)
                    ? "bg-sidebar-accent text-white"
                    : "text-white/80 hover:bg-sidebar-accent/70 hover:text-white"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-sidebar-accent/30 p-4">
            <div className="mb-2 flex items-center">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent/50 text-center leading-8">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-white/70">Usuário autenticado</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-2 w-full justify-start text-white/80 hover:bg-sidebar-accent/70 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="ml-4 text-xl font-semibold lg:ml-0">
              {navigation.find((item) => isActiveRoute(item.href))?.name || "Aluga Simples"}
            </div>
            <div className="flex items-center">
              {/* This space can be used for notifications, user dropdown, etc. */}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;

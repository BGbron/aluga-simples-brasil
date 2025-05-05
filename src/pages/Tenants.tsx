
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tenant } from "@/lib/types";
import { getTenants, getProperties } from "@/lib/mockData";
import { Users, Plus, Search, Calendar, Home } from "lucide-react";

const Tenants = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: getProperties,
  });

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property ? property.name : "Sem imóvel";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Inquilinos</h1>
        <Button className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Inquilino
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar inquilinos..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Carregando inquilinos...</p>
        </div>
      ) : filteredTenants.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTenants.map((tenant) => (
            <Link key={tenant.id} to={`/inquilinos/${tenant.id}`}>
              <Card className="h-full transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{tenant.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tenant.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tenant.phone}
                      </p>

                      <div className="mt-4 space-y-2 border-t pt-4">
                        <div className="flex items-center text-sm">
                          <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            Imóvel: <span className="font-medium">{getPropertyName(tenant.propertyId)}</span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            Contrato: <span className="font-medium">{new Date(tenant.startDate).toLocaleDateString("pt-BR")} a {new Date(tenant.endDate).toLocaleDateString("pt-BR")}</span>
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <span className="mr-1 text-muted-foreground">Aluguel:</span>
                            <span className="font-medium">R$ {tenant.rentAmount.toLocaleString("pt-BR")}</span>
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1 text-muted-foreground">Vencimento:</span>
                            <span className="font-medium">Dia {tenant.dueDay}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Users className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">Nenhum inquilino encontrado</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {searchTerm
              ? "Nenhum inquilino corresponde à sua busca."
              : "Você ainda não tem inquilinos cadastrados."}
          </p>
          {!searchTerm && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Inquilino
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Tenants;


import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Property } from "@/lib/types";
import { getProperties, getTenants } from "@/lib/mockData";
import { Building, Plus, Search } from "lucide-react";

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: getProperties,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
  });

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTenantName = (propertyId: string) => {
    const tenant = tenants.find((t) => t.propertyId === propertyId);
    return tenant ? tenant.name : "Sem inquilino";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Imóveis</h1>
        <Button className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Imóvel
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar imóveis..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Carregando imóveis...</p>
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <Link key={property.id} to={`/imoveis/${property.id}`}>
              <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {property.imageUrl ? (
                    <img
                      src={property.imageUrl}
                      alt={property.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Building className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{property.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {property.address}, {property.city}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                        property.status === "occupied"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {property.status === "occupied" ? "Ocupado" : "Disponível"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs">
                      {property.type}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs">
                      {property.bedrooms} quartos
                    </span>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs">
                      {property.bathrooms} banheiros
                    </span>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs">
                      {property.area} m²
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t text-sm">
                    <span className="text-muted-foreground">
                      Inquilino:{" "}
                      <span className="font-medium text-foreground">
                        {getTenantName(property.id)}
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Building className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">Nenhum imóvel encontrado</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {searchTerm
              ? "Nenhum imóvel corresponde à sua busca."
              : "Você ainda não tem imóveis cadastrados."}
          </p>
          {!searchTerm && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Imóvel
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Properties;

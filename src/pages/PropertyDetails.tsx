
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, Calendar, ChevronLeft, Edit, Trash } from "lucide-react";
import { getProperty, getTenants, getPaymentsForProperty } from "@/lib/mockData";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");

  const { data: property, isLoading: isPropertyLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getProperty(id as string),
    enabled: !!id,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["propertyPayments", id],
    queryFn: () => getPaymentsForProperty(id as string),
    enabled: !!id,
  });

  const tenant = tenants.find((t) => t.propertyId === id);

  if (isPropertyLoading) {
    return <div className="flex justify-center py-8">Carregando...</div>;
  }

  if (!property) {
    return <div className="flex justify-center py-8">Imóvel não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/imoveis")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{property.name}</h1>
          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
              property.status === "occupied"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {property.status === "occupied" ? "Ocupado" : "Disponível"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline" size="sm" className="text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle>Detalhes do Imóvel</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
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

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Endereço</p>
                  <p className="text-sm text-muted-foreground">
                    {property.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Cidade/Estado</p>
                  <p className="text-sm text-muted-foreground">
                    {property.city}, {property.state}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">CEP</p>
                  <p className="text-sm text-muted-foreground">
                    {property.zipCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Tipo</p>
                  <p className="text-sm text-muted-foreground">
                    {property.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Quartos</p>
                  <p className="text-sm text-muted-foreground">
                    {property.bedrooms}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Banheiros</p>
                  <p className="text-sm text-muted-foreground">
                    {property.bathrooms}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Área</p>
                  <p className="text-sm text-muted-foreground">
                    {property.area} m²
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Inquilino Atual</CardTitle>
            </CardHeader>
            <CardContent>
              {tenant ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Desde {new Date(tenant.startDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium">Valor do Aluguel</p>
                      <p className="text-sm">
                        R$ {tenant.rentAmount.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Vencimento</p>
                      <p className="text-sm">Dia {tenant.dueDay}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Contrato</p>
                      <p className="text-sm">
                        Até {new Date(tenant.endDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Link to={`/inquilinos/${tenant.id}`} className="w-full">
                    <Button className="mt-2 w-full" variant="outline">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Users className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Este imóvel não possui inquilino
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Adicionar Inquilino
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pagamentos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.slice(0, 3).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {payment.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          R$ {payment.amount.toLocaleString("pt-BR")}
                        </p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {payment.status === "paid"
                            ? "Pago"
                            : payment.status === "overdue"
                            ? "Em atraso"
                            : "Pendente"}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Link to="/pagamentos" className="w-full">
                    <Button className="mt-2 w-full" variant="outline">
                      Ver Todos
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum pagamento registrado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

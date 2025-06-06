
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property, Tenant, Payment } from "@/lib/types";
import { getProperties, getTenants, getPayments } from "@/lib/mockData";
import { Building, Users, Calendar, CreditCard, Plus, ArrowRight, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: getProperties,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
  });

  // Filter payments by status
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const overduePayments = payments.filter((p) => p.status === "overdue");
  const paidPayments = payments.filter((p) => p.status === "paid");

  // Calculate total rent from occupied properties
  const totalRentValue = properties
    .filter(property => property.status === "occupied")
    .reduce((total, property) => total + property.rentAmount, 0);
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Imóveis
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">
              {properties.filter((p) => p.status === "occupied").length} ocupados,{" "}
              {properties.filter((p) => p.status === "available").length} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Inquilinos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
            <p className="text-xs text-muted-foreground">
              Valor total de aluguel: R$ {totalRentValue.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagamentos Pendentes
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              Para os próximos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagamentos em Atraso
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overduePayments.length}</div>
            <p className="text-xs text-muted-foreground">
              Ação necessária
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Imóveis Recentes</CardTitle>
            <Link to="/imoveis">
              <Button variant="outline" size="sm">
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {properties.slice(0, 3).map((property) => (
                <div key={property.id} className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                    {property.imageUrl ? (
                      <img
                        src={property.imageUrl}
                        alt={property.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Link to={`/imoveis/${property.id}`} className="font-medium text-primary hover:underline">
                        {property.name}
                      </Link>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          property.status === "occupied"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {property.status === "occupied" ? "Ocupado" : "Disponível"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{`${property.address}, ${property.city}`}</p>
                  </div>
                </div>
              ))}

              {properties.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6">
                  <Building className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhum imóvel cadastrado</p>
                  <Link to="/imoveis" className="mt-2">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Imóvel
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Próximos Pagamentos</CardTitle>
            <Link to="/pagamentos">
              <Button variant="outline" size="sm">
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments
                .filter((p) => p.status === "pending" || p.status === "overdue")
                .slice(0, 4)
                .map((payment) => {
                  const tenant = tenants.find((t) => t.id === payment.tenantId);
                  const property = properties.find((p) => p.id === payment.propertyId);

                  return (
                    <div key={payment.id} className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          payment.status === "overdue"
                            ? "bg-red-100"
                            : "bg-amber-100"
                        }`}
                      >
                        <CreditCard
                          className={`h-5 w-5 ${
                            payment.status === "overdue"
                              ? "text-red-600"
                              : "text-amber-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <Link to={`/inquilinos/${tenant?.id}`} className="font-medium hover:underline">
                            {tenant?.name}
                          </Link>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              payment.status === "overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {payment.status === "overdue" ? "Em atraso" : "Pendente"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">
                            {property?.name} • Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="text-xs font-medium">
                            R$ {payment.amount.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {payments.filter((p) => p.status === "pending" || p.status === "overdue").length === 0 && (
                <div className="flex flex-col items-center justify-center py-6">
                  <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhum pagamento pendente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

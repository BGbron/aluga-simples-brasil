
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Edit, Trash, Building, Calendar, Mail, Phone, CreditCard } from "lucide-react";
import { getTenant, getProperty, getPaymentsForTenant, deleteTenant } from "@/lib/mockData";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import EditTenantDialog from "@/components/EditTenantDialog";

const TenantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: tenant, isLoading: isTenantLoading } = useQuery({
    queryKey: ["tenant", id],
    queryFn: () => getTenant(id as string),
    enabled: !!id,
  });

  const { data: property } = useQuery({
    queryKey: ["property", tenant?.propertyId],
    queryFn: () => getProperty(tenant?.propertyId as string),
    enabled: !!tenant?.propertyId,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["tenantPayments", id],
    queryFn: () => getPaymentsForTenant(id as string),
    enabled: !!id,
  });

  const deleteTenantMutation = useMutation({
    mutationFn: () => deleteTenant(id as string),
    onSuccess: () => {
      toast("Inquilino excluído", {
        description: "O inquilino foi excluído com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      navigate("/inquilinos");
    },
    onError: () => {
      toast("Erro", {
        description: "Não foi possível excluir o inquilino. Tente novamente."
      });
    },
  });

  const handleDeleteTenant = () => {
    deleteTenantMutation.mutate();
  };

  if (isTenantLoading) {
    return <div className="flex justify-center py-8">Carregando...</div>;
  }

  if (!tenant) {
    return <div className="flex justify-center py-8">Inquilino não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/inquilinos")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{tenant.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Inquilino</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o inquilino {tenant.name}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTenant} className="bg-destructive hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Detalhes do Inquilino</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{tenant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 flex items-center justify-center text-muted-foreground">
                      <span className="text-xs font-bold">ID</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">CPF</p>
                      <p className="text-sm text-muted-foreground">{tenant.cpf}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Início do Contrato</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tenant.startDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fim do Contrato</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tenant.endDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  {property && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Valor do Aluguel</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {property.rentAmount.toLocaleString("pt-BR")} (vencimento dia {property.dueDay})
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t pt-6">
                <h3 className="mb-4 text-base font-medium">Histórico de Pagamentos</h3>
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                            {payment.paidDate && 
                              ` • Pago em: ${new Date(payment.paidDate).toLocaleDateString("pt-BR")}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
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
                  </div>
                ) : (
                  <div className="flex justify-center py-4 text-muted-foreground">
                    Nenhum pagamento registrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Imóvel Alugado</CardTitle>
            </CardHeader>
            <CardContent>
              {property ? (
                <div className="space-y-4">
                  <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                    {property.imageUrl ? (
                      <img
                        src={property.imageUrl}
                        alt={property.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{property.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {property.address}, {property.city} - {property.state}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center rounded border p-2">
                      <p className="text-xs text-muted-foreground">Quartos</p>
                      <p className="font-medium">{property.bedrooms}</p>
                    </div>
                    <div className="text-center rounded border p-2">
                      <p className="text-xs text-muted-foreground">Banheiros</p>
                      <p className="font-medium">{property.bathrooms}</p>
                    </div>
                    <div className="text-center rounded border p-2">
                      <p className="text-xs text-muted-foreground">Área</p>
                      <p className="font-medium">{property.area} m²</p>
                    </div>
                    <div className="text-center rounded border p-2">
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <p className="font-medium">{property.type}</p>
                    </div>
                  </div>
                  <Link to={`/imoveis/${property.id}`} className="w-full">
                    <Button className="mt-2 w-full" variant="outline">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Building className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum imóvel associado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Registrar Novo Pagamento
            </Button>
          </div>
        </div>
      </div>

      <EditTenantDialog
        tenant={tenant}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["tenant", id] });
          queryClient.invalidateQueries({ queryKey: ["tenants"] });
          queryClient.invalidateQueries({ queryKey: ["properties"] });
        }}
      />
    </div>
  );
};

export default TenantDetails;

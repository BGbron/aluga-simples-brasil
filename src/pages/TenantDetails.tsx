import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenant, getPaymentsForTenant, updatePayment } from "@/lib/supabaseQueries";
import { Payment, Tenant } from "@/lib/types";
import { User } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import PaymentStatusSelect from "@/components/PaymentStatusSelect";
import DeleteTenantDialog from "@/components/DeleteTenantDialog";

const TenantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<"pending" | "paid" | "overdue" | null>(null);

  const { data: tenant, isLoading: isTenantLoading } = useQuery({
    queryKey: ["tenant", id],
    queryFn: () => getTenant(id as string),
    enabled: !!id,
  });

  const { data: payments, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["payments", id],
    queryFn: () => getPaymentsForTenant(id as string),
    enabled: !!id,
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ paymentId, status }: { paymentId: string; status: "pending" | "paid" | "overdue" }) => {
      const paymentToUpdate = payments?.find((payment) => payment.id === paymentId);
      if (!paymentToUpdate) {
        throw new Error("Pagamento não encontrado");
      }

      // Mapear campos do frontend para o banco de dados corretamente
      const updatedPayment = {
        id: paymentId,
        status,
        paid_date: status === "paid" ? new Date().toISOString().split('T')[0] : null,
        // Manter outros campos inalterados
        amount: paymentToUpdate.amount,
        due_date: paymentToUpdate.dueDate || paymentToUpdate.due_date,
        tenant_id: paymentToUpdate.tenantId || paymentToUpdate.tenant_id,
        property_id: paymentToUpdate.propertyId || paymentToUpdate.property_id,
        description: paymentToUpdate.description,
      };

      return updatePayment(paymentId, updatedPayment);
    },
    onSuccess: () => {
      toast({
        title: "Pagamento atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["payments", id] });
    },
    onError: (error) => {
      console.error("Error updating payment:", error);
      toast({
        title: "Erro ao atualizar pagamento.",
        variant: "destructive",
      });
    },
  });

  if (isTenantLoading) {
    return <div>Carregando informações do inquilino...</div>;
  }

  if (!tenant) {
    return <div>Inquilino não encontrado.</div>;
  }

  const handlePaymentStatusChange = async (paymentId: string, newStatus: "pending" | "paid" | "overdue") => {
    try {
      await updatePaymentMutation.mutateAsync({ paymentId, status: newStatus });
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleTenantDeleted = () => {
    navigate("/inquilinos");
  };

  const filteredPayments = selectedPaymentStatus
    ? payments?.filter((payment) => payment.status === selectedPaymentStatus)
    : payments;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/inquilinos")}>
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detalhes do Inquilino</h1>
            <p className="text-muted-foreground">
              Informações e histórico de pagamentos do inquilino
            </p>
          </div>
        </div>
        
        <DeleteTenantDialog 
          tenantId={tenant.id}
          tenantName={tenant.name}
          onSuccess={handleTenantDeleted}
        />
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Inquilino
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Nome</p>
              <p className="text-gray-800">{tenant.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-gray-800">{tenant.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Telefone</p>
              <p className="text-gray-800">{tenant.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium">CPF</p>
              <p className="text-gray-800">{tenant.cpf}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Data de Início</p>
              <p className="text-gray-800">
                {format(new Date(tenant.startDate), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Data de Fim</p>
              <p className="text-gray-800">
                {tenant.endDate ? format(new Date(tenant.endDate), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR }) : 'Não definida'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm font-medium">Filtrar por Status:</p>
            <div className="flex gap-2">
              <Button
                variant={selectedPaymentStatus === null ? "default" : "outline"}
                onClick={() => setSelectedPaymentStatus(null)}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={selectedPaymentStatus === "pending" ? "default" : "outline"}
                onClick={() => setSelectedPaymentStatus("pending")}
                size="sm"
              >
                Pendentes
              </Button>
              <Button
                variant={selectedPaymentStatus === "paid" ? "default" : "outline"}
                onClick={() => setSelectedPaymentStatus("paid")}
                size="sm"
              >
                Pagos
              </Button>
              <Button
                variant={selectedPaymentStatus === "overdue" ? "default" : "outline"}
                onClick={() => setSelectedPaymentStatus("overdue")}
                size="sm"
              >
                Atrasados
              </Button>
            </div>
          </div>

          {isPaymentsLoading ? (
            <div>Carregando histórico de pagamentos...</div>
          ) : (
            <div className="space-y-3">
              {filteredPayments && filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <div key={payment.id} className="border rounded-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Valor</p>
                        <p className="text-gray-800">R$ {payment.amount.toLocaleString("pt-BR")}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Vencimento</p>
                        <p className="text-gray-800">
                          {format(new Date(payment.dueDate || payment.due_date), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <PaymentStatusSelect
                          status={payment.status}
                          onStatusChange={(newStatus) => handlePaymentStatusChange(payment.id, newStatus)}
                        />
                      </div>
                    </div>
                    {(payment.paidDate || payment.paid_date) && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Data de Pagamento</p>
                        <p className="text-gray-800">
                          {format(new Date(payment.paidDate || payment.paid_date), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div>Nenhum pagamento encontrado para este inquilino.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantDetails;

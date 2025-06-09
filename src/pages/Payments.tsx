
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Search, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getPayments, updatePayment, getTenants, getProperties, generateMonthlyPayments, updateOverduePayments } from "@/lib/supabaseQueries";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: getProperties,
  });

  // Auto-generate payments and update overdue status on component mount
  useEffect(() => {
    const initializePayments = async () => {
      try {
        await generateMonthlyPayments();
        await updateOverduePayments();
        queryClient.invalidateQueries({ queryKey: ["payments"] });
      } catch (error) {
        console.error('Error initializing payments:', error);
      }
    };
    
    initializePayments();
  }, [queryClient]);

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "paid" | "pending" | "overdue" }) =>
      updatePayment(id, { status }),
    onSuccess: () => {
      toast("Pagamento atualizado", {
        description: "Status do pagamento foi atualizado com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: () => {
      toast("Erro", {
        description: "Não foi possível atualizar o pagamento. Tente novamente."
      });
    },
  });

  const filteredPayments = payments.filter((payment) => {
    const tenant = tenants.find(t => t.id === payment.tenantId);
    const property = properties.find(p => p.id === payment.propertyId);
    
    const matchesSearch = 
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default" as const;
      case "overdue":
        return "destructive" as const;
      case "pending":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "overdue":
        return "Em atraso";
      case "pending":
        return "Pendente";
      default:
        return "Pendente";
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Carregando pagamentos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Pagamentos</h1>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pagamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="overdue">Em atraso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPayments.length > 0 ? (
        <div className="grid gap-4">
          {filteredPayments.map((payment) => {
            const tenant = tenants.find(t => t.id === payment.tenantId);
            const property = properties.find(p => p.id === payment.propertyId);
            
            return (
              <Card key={payment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{payment.description}</h3>
                        <Badge variant={getStatusVariant(payment.status)}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1">{getStatusText(payment.status)}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Inquilino: {tenant?.name || "Não encontrado"}</p>
                        <p>Imóvel: {property?.name || "Não encontrado"}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}</span>
                          {payment.paidDate && (
                            <span className="ml-2">
                              • Pago em: {new Date(payment.paidDate).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        R$ {payment.amount.toLocaleString("pt-BR")}
                      </p>
                      {payment.status !== "paid" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updatePaymentMutation.mutate({
                              id: payment.id,
                              status: "paid",
                            })
                          }
                          disabled={updatePaymentMutation.isPending}
                          className="mt-2"
                        >
                          Marcar como Pago
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum pagamento encontrado</h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Os pagamentos serão gerados automaticamente quando você adicionar inquilinos."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Payments;

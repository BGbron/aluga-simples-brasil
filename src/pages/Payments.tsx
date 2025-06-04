import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter, Calendar, Check } from "lucide-react";
import { getPayments, addPayment, updatePayment, getTenants, getProperties } from "@/lib/mockData";
import { Payment, PaymentStatus } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Payments = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
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

  const addMutation = useMutation({
    mutationFn: addPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setShowForm(false);
      toast({
        title: "Pagamento criado",
        description: "O pagamento foi criado com sucesso.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payment> }) =>
      updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({
        title: "Pagamento atualizado",
        description: "O status do pagamento foi atualizado.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const paymentData = {
      description: formData.get("description") as string || "",
      amount: Number(formData.get("amount")),
      dueDate: formData.get("dueDate") as string,
      tenantId: formData.get("tenantId") as string,
      propertyId: formData.get("propertyId") as string,
      status: "pending" as PaymentStatus,
    };

    addMutation.mutate(paymentData);
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: PaymentStatus) => {
    const variants = {
      pending: "secondary",
      paid: "default",
      overdue: "destructive",
    } as const;

    const labels = {
      pending: "Pendente",
      paid: "Pago",
      overdue: "Atrasado",
    };

    return (
      <Badge variant={variants[status] as keyof typeof variants}>
        {labels[status]}
      </Badge>
    );
  };

  const markAsPaid = (paymentId: string) => {
    updateMutation.mutate({
      id: paymentId,
      data: { status: "paid" as PaymentStatus },
    });
  };

  if (paymentsLoading) {
    return <div className="flex h-64 items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pagamento
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Buscar pagamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="overdue">Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Ex: Aluguel Janeiro 2024"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tenantId">Inquilino</Label>
                  <Select name="tenantId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um inquilino" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="propertyId">Imóvel</Label>
                  <Select name="propertyId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Criando..." : "Criar Pagamento"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payments List */}
      <div className="grid gap-4">
        {filteredPayments.map((payment) => {
          const tenant = tenants.find((t) => t.id === payment.tenantId);
          const property = properties.find((p) => p.id === payment.propertyId);
          
          return (
            <Card key={payment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{payment.description}</h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Inquilino: {tenant?.name} • Imóvel: {property?.address}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Vence: {format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      {payment.paidDate && (
                        <span className="flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Pago: {format(new Date(payment.paidDate), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold">
                      R$ {payment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    {payment.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => markAsPaid(payment.id)}
                        disabled={updateMutation.isPending}
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
        
        {filteredPayments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Nenhum pagamento encontrado com os filtros aplicados."
                  : "Nenhum pagamento cadastrado ainda."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Payments;

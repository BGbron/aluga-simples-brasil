import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Payment, PaymentStatus } from "@/lib/types";
import { getPayments, getTenants, getProperties, updatePayment } from "@/lib/mockData";
import { Calendar, CreditCard, Plus, Search, ArrowUpDown, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/components/ui/sonner";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast: uiToast } = useToast();

  const { data: payments = [], isLoading: isPaymentsLoading } = useQuery({
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

  // Mutation para marcar pagamento como pago
  const markAsPaidMutation = useMutation({
    mutationFn: (paymentId: string) => {
      return updatePayment(paymentId, { status: "paid" as PaymentStatus });
    },
    onSuccess: () => {
      // Atualizar a cache de dados após o sucesso
      toast("Pagamento atualizado", {
        description: "O pagamento foi marcado como pago com sucesso.",
      });
      
      // Recarregar os dados após a atualização
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => {
      console.error("Erro ao marcar como pago:", error);
      uiToast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar o pagamento como pago. Tente novamente.",
      });
    },
  });

  const handleMarkAsPaid = (paymentId: string) => {
    markAsPaidMutation.mutate(paymentId);
  };

  // Filter payments based on search term and status
  const filteredPayments = payments
    .filter((payment) => {
      const tenant = tenants.find((t) => t.id === payment.tenantId);
      const property = properties.find((p) => p.id === payment.propertyId);
      
      const searchMatch =
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusMatch = statusFilter === "all" || payment.status === statusFilter;
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "overdue":
        return "Em atraso";
      case "pending":
        return "Pendente";
      default:
        return status;
    }
  };

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const overdueCount = payments.filter((p) => p.status === "overdue").length;
  const paidCount = payments.filter((p) => p.status === "paid").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Pagamentos</h1>
        <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Novo Pagamento</DialogTitle>
              <DialogDescription>
                Crie um novo registro de pagamento para um inquilino.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p>Formulário a ser implementado em uma futura atualização.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                toast("Pagamento criado", {
                  description: "Um novo pagamento foi registrado com sucesso.",
                });
                setIsAddPaymentOpen(false);
              }}>
                Criar Pagamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos em Atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <div className="rounded-full bg-red-100 p-2 text-red-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{paidCount}</div>
              <div className="rounded-full bg-green-100 p-2 text-green-600">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
                  Todos
                </TabsTrigger>
                <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
                  Pendentes
                </TabsTrigger>
                <TabsTrigger value="overdue" onClick={() => setStatusFilter("overdue")}>
                  Em Atraso
                </TabsTrigger>
                <TabsTrigger value="paid" onClick={() => setStatusFilter("paid")}>
                  Pagos
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pagamentos..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="mt-4">
              <PaymentList
                payments={filteredPayments}
                tenants={tenants}
                properties={properties}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                onMarkAsPaid={handleMarkAsPaid}
              />
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <PaymentList
                payments={filteredPayments.filter((p) => p.status === "pending")}
                tenants={tenants}
                properties={properties}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                onMarkAsPaid={handleMarkAsPaid}
              />
            </TabsContent>
            <TabsContent value="overdue" className="mt-4">
              <PaymentList
                payments={filteredPayments.filter((p) => p.status === "overdue")}
                tenants={tenants}
                properties={properties}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                onMarkAsPaid={handleMarkAsPaid}
              />
            </TabsContent>
            <TabsContent value="paid" className="mt-4">
              <PaymentList
                payments={filteredPayments.filter((p) => p.status === "paid")}
                tenants={tenants}
                properties={properties}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                onMarkAsPaid={handleMarkAsPaid}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

interface PaymentListProps {
  payments: Payment[];
  tenants: any[];
  properties: any[];
  getStatusColor: (status: PaymentStatus) => string;
  getStatusText: (status: PaymentStatus) => string;
  onMarkAsPaid: (paymentId: string) => void;
}

const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  tenants,
  properties,
  getStatusColor,
  getStatusText,
  onMarkAsPaid
}) => {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium">Nenhum pagamento encontrado</h3>
        <p className="text-sm text-muted-foreground">
          Não há pagamentos correspondentes aos filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const tenant = tenants.find((t) => t.id === payment.tenantId);
        const property = properties.find((p) => p.id === payment.propertyId);

        return (
          <div
            key={payment.id}
            className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="font-medium">{payment.description}</p>
                <div className="mt-1 flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">
                    Inquilino:{" "}
                    <Link
                      to={`/inquilinos/${tenant?.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {tenant?.name || "Desconhecido"}
                    </Link>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">
                    Imóvel:{" "}
                    <Link
                      to={`/imoveis/${property?.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {property?.name || "Desconhecido"}
                    </Link>
                  </p>
                </div>
              </div>

              <div>
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">
                    Data de vencimento:
                  </p>
                  <p className="font-medium">{new Date(payment.dueDate).toLocaleDateString("pt-BR")}</p>
                </div>
                {payment.paidDate && (
                  <div className="mt-1 flex flex-col">
                    <p className="text-sm text-muted-foreground">
                      Data de pagamento:
                    </p>
                    <p className="font-medium">{new Date(payment.paidDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between md:justify-end">
                <div className="flex flex-col items-end">
                  <p className="text-lg font-bold">
                    R$ {payment.amount.toLocaleString("pt-BR")}
                  </p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {getStatusText(payment.status)}
                  </span>
                </div>
                <div className="ml-4">
                  {payment.status !== "paid" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsPaid(payment.id)}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Marcar como Pago
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Payments;

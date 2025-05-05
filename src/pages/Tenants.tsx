import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tenant } from "@/lib/types";
import { getTenants, getProperties, addTenant } from "@/lib/mockData";
import { Users, Plus, Search, Calendar, Home } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const tenantFormSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(8, { message: "Telefone inválido" }),
  cpf: z.string().min(11, { message: "CPF inválido" }),
  propertyId: z.string().min(1, { message: "Selecione um imóvel" }),
  startDate: z.string().min(1, { message: "Data de início inválida" }),
  endDate: z.string().min(1, { message: "Data de término inválida" }),
  rentAmount: z.string().min(1, { message: "Valor do aluguel inválido" }),
  dueDay: z.string().min(1, { message: "Dia de vencimento inválido" }),
});

const Tenants = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: getProperties,
  });

  const addTenantMutation = useMutation({
    mutationFn: (data: z.infer<typeof tenantFormSchema>) => {
      return addTenant({
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        propertyId: data.propertyId,
        startDate: data.startDate,
        endDate: data.endDate,
        rentAmount: Number(data.rentAmount),
        dueDay: Number(data.dueDay),
      });
    },
    onSuccess: () => {
      toast("Inquilino adicionado", {
        description: "O inquilino foi adicionado com sucesso."
      });
      form.reset();
      setIsAddTenantOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: () => {
      toast("Erro", {
        description: "Não foi possível adicionar o inquilino. Tente novamente."
      });
    },
  });

  const form = useForm<z.infer<typeof tenantFormSchema>>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      propertyId: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      rentAmount: "",
      dueDay: "10",
    },
  });

  const onSubmit = (data: z.infer<typeof tenantFormSchema>) => {
    addTenantMutation.mutate(data);
  };

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

  const availableProperties = properties.filter(p => p.status === "available");

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Inquilinos</h1>
        <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Inquilino
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Adicionar Inquilino</DialogTitle>
              <DialogDescription>
                Preencha os dados para adicionar um novo inquilino.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="propertyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imóvel</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um imóvel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableProperties.length > 0 ? (
                              availableProperties.map((property) => (
                                <SelectItem key={property.id} value={property.id}>
                                  {property.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                Nenhum imóvel disponível
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor do Aluguel</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0,00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Término</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia de Vencimento</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="31" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddTenantOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={addTenantMutation.isPending}>
                    {addTenantMutation.isPending ? "Adicionando..." : "Adicionar Inquilino"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
            <Button onClick={() => setIsAddTenantOpen(true)}>
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

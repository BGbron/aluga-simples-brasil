
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tenant } from "@/lib/types";
import { getProperties, updateTenant } from "@/lib/mockData";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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

const editTenantFormSchema = z.object({
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

interface EditTenantDialogProps {
  tenant: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditTenantDialog: React.FC<EditTenantDialogProps> = ({
  tenant,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: getProperties,
  });

  const updateTenantMutation = useMutation({
    mutationFn: (data: z.infer<typeof editTenantFormSchema>) => {
      return updateTenant(tenant.id, {
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
      toast("Inquilino atualizado", {
        description: "Os dados do inquilino foram atualizados com sucesso."
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: () => {
      toast("Erro", {
        description: "Não foi possível atualizar o inquilino. Tente novamente."
      });
    },
  });

  const form = useForm<z.infer<typeof editTenantFormSchema>>({
    resolver: zodResolver(editTenantFormSchema),
    defaultValues: {
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      cpf: tenant.cpf,
      propertyId: tenant.propertyId,
      startDate: tenant.startDate,
      endDate: tenant.endDate,
      rentAmount: tenant.rentAmount.toString(),
      dueDay: tenant.dueDay.toString(),
    },
  });

  const onSubmit = (data: z.infer<typeof editTenantFormSchema>) => {
    updateTenantMutation.mutate(data);
  };

  const availableProperties = properties.filter(p => 
    p.status === "available" || p.id === tenant.propertyId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Inquilino</DialogTitle>
          <DialogDescription>
            Atualize os dados do inquilino.
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateTenantMutation.isPending}>
                {updateTenantMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTenantDialog;

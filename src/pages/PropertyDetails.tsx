
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, Calendar, ChevronLeft, Edit, Trash } from "lucide-react";
import { getProperty, getTenants, getPaymentsForProperty, updateProperty, deleteProperty } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
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

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
  });

  const { data: property, isLoading: isPropertyLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getProperty(id as string),
    enabled: !!id,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          area: data.area,
        });
      }
    },
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

  const updatePropertyMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      return updateProperty(id as string, data);
    },
    onSuccess: () => {
      toast("Imóvel atualizado", {
        description: "As informações do imóvel foram atualizadas com sucesso.",
      });
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["property", id] });
    },
    onError: () => {
      toast("Erro", {
        description: "Não foi possível atualizar o imóvel. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: () => {
      return deleteProperty(id as string);
    },
    onSuccess: () => {
      toast("Imóvel excluído", {
        description: "O imóvel foi excluído com sucesso.",
      });
      navigate("/imoveis");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: () => {
      toast("Erro", {
        description: "Não foi possível excluir o imóvel. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "bedrooms" || name === "bathrooms" || name === "area" 
        ? Number(value) 
        : value,
    }));
  };

  const handleUpdateProperty = () => {
    updatePropertyMutation.mutate(formData);
  };

  const handleDeleteProperty = () => {
    deletePropertyMutation.mutate();
  };

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
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Editar Imóvel</DialogTitle>
                <DialogDescription>
                  Atualize as informações do imóvel.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Nome</label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">Endereço</label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium">Cidade</label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-medium">Estado</label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="zipCode" className="text-sm font-medium">CEP</label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="bedrooms" className="text-sm font-medium">Quartos</label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="bathrooms" className="text-sm font-medium">Banheiros</label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="area" className="text-sm font-medium">Área (m²)</label>
                    <Input
                      id="area"
                      name="area"
                      type="number"
                      value={formData.area}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateProperty} disabled={updatePropertyMutation.isPending}>
                  {updatePropertyMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o imóvel e todos os dados associados a ele.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteProperty}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deletePropertyMutation.isPending}
                >
                  {deletePropertyMutation.isPending ? "Excluindo..." : "Excluir"}
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
                    onClick={() => navigate("/inquilinos")}
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

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Property } from "@/lib/types";
import { getProperties, getTenants, addProperty } from "@/lib/mockData";
import { Building, Plus, Search, Home, Store, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [newProperty, setNewProperty] = useState<Partial<Property>>({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    type: "Apartamento",
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    status: "available",
    rentAmount: 0,
    dueDay: 5
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: getProperties,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
  });

  const addPropertyMutation = useMutation({
    mutationFn: (data: Omit<Property, "id">) => {
      return addProperty(data);
    },
    onSuccess: () => {
      toast({
        title: "Imóvel adicionado",
        description: `${newProperty.name} foi adicionado com sucesso.`,
      });
      
      setIsAddPropertyOpen(false);
      setNewProperty({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        type: "Apartamento",
        bedrooms: 1,
        bathrooms: 1,
        area: 0,
        status: "available",
        rentAmount: 0,
        dueDay: 5
      });
      
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o imóvel. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Check if user has reached property limit (2 properties for free tier)
  const hasReachedLimit = properties.length >= 2;

  const handleAddPropertyClick = () => {
    if (hasReachedLimit) {
      setIsUpgradeDialogOpen(true);
    } else {
      setIsAddPropertyOpen(true);
    }
  };

  const handleUpgradeToSponsored = async () => {
    try {
      // TODO: Integrate with Stripe checkout
      toast({
        title: "Redirecionando para pagamento",
        description: "Você será redirecionado para completar a assinatura premium.",
      });
      
      // Placeholder for Stripe integration
      console.log("Redirecting to Stripe checkout...");
      setIsUpgradeDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTenantName = (propertyId: string) => {
    const tenant = tenants.find((t) => t.propertyId === propertyId);
    return tenant ? tenant.name : "Sem inquilino";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProperty(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProperty(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setNewProperty(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProperty = async () => {
    if (!newProperty.name || !newProperty.address || !newProperty.city) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }
    
    const propertyToAdd = {
      name: newProperty.name!,
      address: newProperty.address!,
      city: newProperty.city!,
      state: newProperty.state || "",
      zipCode: newProperty.zipCode || "",
      type: newProperty.type || "Apartamento",
      bedrooms: newProperty.bedrooms || 0,
      bathrooms: newProperty.bathrooms || 0,
      area: newProperty.area || 0,
      status: "available" as const,
      rentAmount: newProperty.rentAmount || 0,
      dueDay: newProperty.dueDay || 5,
    };
    
    addPropertyMutation.mutate(propertyToAdd);
  };

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case "Casa":
        return <Home className="h-12 w-12 text-gray-400" />;
      case "Apartamento":
        return <Building className="h-12 w-12 text-gray-400" />;
      case "Comercial":
      case "Kitnet":
        return <Store className="h-12 w-12 text-gray-400" />;
      default:
        return <Building className="h-12 w-12 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Imóveis</h1>
          <p className="text-sm text-muted-foreground">
            {properties.length}/2 imóveis cadastrados {hasReachedLimit && "(Limite atingido - Faça upgrade para mais)"}
          </p>
        </div>
        
        <Button onClick={handleAddPropertyClick} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Imóvel
        </Button>

        {/* Upgrade Dialog */}
        <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Upgrade para Premium
              </DialogTitle>
              <DialogDescription>
                Você atingiu o limite de 2 imóveis cadastrados no plano gratuito.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert>
                <Crown className="h-4 w-4" />
                <AlertTitle>Plano Premium</AlertTitle>
                <AlertDescription>
                  Com o plano premium você pode:
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Cadastrar imóveis ilimitados</li>
                    <li>Relatórios avançados</li>
                    <li>Suporte prioritário</li>
                  </ul>
                  <div className="mt-3 font-semibold">
                    Apenas R$ 29,90/mês
                  </div>
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpgradeToSponsored} className="bg-yellow-600 hover:bg-yellow-700">
                <Crown className="mr-2 h-4 w-4" />
                Assinar Premium
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Property Dialog */}
        <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Imóvel</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo imóvel abaixo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Imóvel</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newProperty.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Apartamento Centro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={newProperty.type} 
                    onValueChange={(value) => handleSelectChange(value, "type")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartamento">Apartamento</SelectItem>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Kitnet">Kitnet</SelectItem>
                      <SelectItem value="Comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  value={newProperty.address}
                  onChange={handleInputChange}
                  placeholder="Rua, número, complemento"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    name="city"
                    value={newProperty.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    name="state"
                    value={newProperty.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={newProperty.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    value={newProperty.bedrooms}
                    onChange={handleNumberInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Banheiros</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    value={newProperty.bathrooms}
                    onChange={handleNumberInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    min="0"
                    value={newProperty.area}
                    onChange={handleNumberInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rentAmount">Valor do Aluguel (R$)</Label>
                  <Input
                    id="rentAmount"
                    name="rentAmount"
                    type="number"
                    min="0"
                    value={newProperty.rentAmount}
                    onChange={handleNumberInputChange}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDay">Dia de Vencimento</Label>
                  <Input
                    id="dueDay"
                    name="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={newProperty.dueDay}
                    onChange={handleNumberInputChange}
                    placeholder="5"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPropertyOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProperty}>
                Adicionar Imóvel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar imóveis..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Progress bar showing property limit */}
      {properties.length > 0 && (
        <div className="rounded-lg border p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Limite de imóveis</span>
            <span className="text-sm text-muted-foreground">{properties.length}/2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                hasReachedLimit ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(properties.length / 2) * 100}%` }}
            ></div>
          </div>
          {hasReachedLimit && (
            <p className="text-xs text-red-600 mt-2">
              Limite atingido. Faça upgrade para cadastrar mais imóveis.
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Carregando imóveis...</p>
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <Link key={property.id} to={`/imoveis/${property.id}`}>
              <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {property.imageUrl ? (
                    <img
                      src={property.imageUrl}
                      alt={property.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      {getPropertyIcon(property.type)}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{property.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {property.address}, {property.city}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                        property.status === "occupied"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {property.status === "occupied" ? "Ocupado" : "Disponível"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs">
                      {property.type}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs">
                      {property.bedrooms} quartos
                    </span>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs">
                      {property.bathrooms} banheiros
                    </span>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs">
                      {property.area} m²
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t text-sm">
                    <span className="text-muted-foreground">
                      Inquilino:{" "}
                      <span className="font-medium text-foreground">
                        {getTenantName(property.id)}
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Building className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">Nenhum imóvel encontrado</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {searchTerm
              ? "Nenhum imóvel corresponde à sua busca."
              : "Você ainda não tem imóveis cadastrados."}
          </p>
          {!searchTerm && (
            <Button onClick={handleAddPropertyClick}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Imóvel
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Properties;

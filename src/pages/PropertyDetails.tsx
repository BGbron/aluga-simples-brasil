
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Property } from "@/lib/types";
import { getProperty, updateProperty, deleteProperty } from "@/lib/mockData";
import { Building, Edit, Trash2, Home, Store } from "lucide-react";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProperty, setEditedProperty] = useState<Property | null>(null);

  // Get property details
  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getProperty(id!),
    enabled: !!id
  });

  // Mutation for updating a property
  const updatePropertyMutation = useMutation({
    mutationFn: (data: Partial<Property>) => updateProperty(id!, data),
    onSuccess: () => {
      toast("Imóvel atualizado", {
        description: "O imóvel foi atualizado com sucesso."
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: () => {
      toast("Erro", {
        description: "Não foi possível atualizar o imóvel."
      });
    }
  });

  // Mutation for deleting a property
  const deletePropertyMutation = useMutation({
    mutationFn: () => deleteProperty(id!),
    onSuccess: () => {
      toast("Imóvel excluído", {
        description: "O imóvel foi excluído com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      navigate("/imoveis");
    },
    onError: () => {
      toast("Erro", {
        description: "Não foi possível excluir o imóvel."
      });
      setIsDeleting(false);
    }
  });

  // Function to get the appropriate icon based on property type
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

  const handleDelete = () => {
    setIsDeleting(true);
    deletePropertyMutation.mutate();
  };

  const handleEditSubmit = () => {
    if (editedProperty) {
      updatePropertyMutation.mutate(editedProperty);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProperty(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProperty(prev => prev ? { ...prev, [name]: parseInt(value) || 0 } : null);
  };

  const handleSelectChange = (value: string, field: string) => {
    setEditedProperty(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (isLoading) {
    return <div className="py-8 text-center">Carregando detalhes do imóvel...</div>;
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Building className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Imóvel não encontrado</h2>
        <p className="mb-4 text-muted-foreground">
          Não foi possível encontrar o imóvel solicitado.
        </p>
        <Button onClick={() => navigate("/imoveis")}>Voltar para Imóveis</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalhes do Imóvel</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(true);
              setEditedProperty(property);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá excluir o imóvel permanentemente. Tem certeza que
                  deseja continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleting(false)}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-1">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4">
              <h3 className="mb-4 text-lg font-semibold">Informações do Imóvel</h3>
              <div className="space-y-2">
                <p>
                  <strong>Nome:</strong> {property.name}
                </p>
                <p>
                  <strong>Endereço:</strong> {property.address}, {property.city} - {property.state}, {property.zipCode}
                </p>
                <p>
                  <strong>Tipo:</strong> {property.type}
                </p>
                <p>
                  <strong>Quartos:</strong> {property.bedrooms}
                </p>
                <p>
                  <strong>Banheiros:</strong> {property.bathrooms}
                </p>
                <p>
                  <strong>Área:</strong> {property.area} m²
                </p>
                <p>
                  <strong>Status:</strong> {property.status === "occupied" ? "Ocupado" : "Disponível"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4">
              <h3 className="mb-4 text-lg font-semibold">Imagem do Imóvel</h3>
              <div className="flex h-48 items-center justify-center rounded-md bg-muted">
                {getPropertyIcon(property.type)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Property Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Imóvel</DialogTitle>
            <DialogDescription>
              Atualize as informações do imóvel nos campos abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Imóvel</Label>
                <Input
                  id="name"
                  name="name"
                  value={editedProperty?.name || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select 
                  value={editedProperty?.type || "Apartamento"}
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
                value={editedProperty?.address || ""}
                onChange={handleEditChange}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  value={editedProperty?.city || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  value={editedProperty?.state || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={editedProperty?.zipCode || ""}
                  onChange={handleEditChange}
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
                  value={editedProperty?.bedrooms || 0}
                  onChange={handleNumberChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Banheiros</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  value={editedProperty?.bathrooms || 0}
                  onChange={handleNumberChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área (m²)</Label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  min="0"
                  value={editedProperty?.area || 0}
                  onChange={handleNumberChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={editedProperty?.status || "available"}
                onValueChange={(value: "available" | "occupied") => handleSelectChange(value, "status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="occupied">Ocupado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyDetails;

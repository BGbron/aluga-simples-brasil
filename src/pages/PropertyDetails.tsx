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
              {property.imageUrl ? (
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="aspect-video w-full rounded-md object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-md bg-muted">
                  {getPropertyIcon(property.type)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

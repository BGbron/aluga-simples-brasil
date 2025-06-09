
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@/lib/types";
import { getProperties } from "@/lib/supabaseQueries";
import { Building, Plus, MapPin, Bed, Bath, Square, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UpgradeDialog from "@/components/UpgradeDialog";
import { useToast } from "@/hooks/use-toast";

const Properties = () => {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { subscriptionData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: getProperties,
  });

  // Check for success/cancel parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast({
        title: "Assinatura realizada com sucesso!",
        description: "Seu plano Premium foi ativado. Agora você pode cadastrar imóveis ilimitados!",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('canceled') === 'true') {
      toast({
        title: "Assinatura cancelada",
        description: "Você ainda pode cadastrar até 2 imóveis no plano gratuito.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handleAddProperty = () => {
    if (!subscriptionData.subscribed && properties.length >= 2) {
      setShowUpgradeDialog(true);
      return;
    }
    
    navigate("/imoveis/adicionar");
  };

  const isAtLimit = !subscriptionData.subscribed && properties.length >= 2;

  if (isLoading) {
    return <div className="flex justify-center py-8">Carregando imóveis...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Imóveis</h1>
          <p className="text-muted-foreground">
            Gerencie seus imóveis cadastrados
            {!subscriptionData.subscribed && (
              <span className="ml-2 text-sm">
                ({properties.length}/2 imóveis no plano gratuito)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddProperty}>
            <Plus className="mr-2 h-4 w-4" />
            {isAtLimit ? "Upgrade para Adicionar" : "Adicionar Imóvel"}
          </Button>
        </div>
      </div>

      {subscriptionData.subscribed && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Plano Premium Ativo</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Você pode cadastrar imóveis ilimitados!
            {subscriptionData.subscription_end && (
              <span className="ml-2">
                Válido até: {new Date(subscriptionData.subscription_end).toLocaleDateString('pt-BR')}
              </span>
            )}
          </p>
        </div>
      )}

      {isAtLimit && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-amber-800">Limite atingido</h3>
              <p className="text-sm text-amber-700">
                Você já cadastrou 2 imóveis (limite do plano gratuito). 
                Faça upgrade para Premium e tenha acesso ilimitado!
              </p>
            </div>
            <Button
              onClick={() => setShowUpgradeDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    property.status === "occupied"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {property.status === "occupied" ? "Ocupado" : "Disponível"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {property.imageUrl ? (
                  <div className="h-48 overflow-hidden rounded-md">
                    <img
                      src={property.imageUrl}
                      alt={property.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
                    <Building className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {property.address}, {property.city}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Bed className="mr-1 h-4 w-4" />
                      {property.bedrooms}
                    </div>
                    <div className="flex items-center">
                      <Bath className="mr-1 h-4 w-4" />
                      {property.bathrooms}
                    </div>
                    <div className="flex items-center">
                      <Square className="mr-1 h-4 w-4" />
                      {property.area}m²
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-lg font-semibold text-green-600">
                        R$ {property.rentAmount.toLocaleString("pt-BR")}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Venc. dia {property.dueDay}
                      </p>
                    </div>
                    <Link to={`/imoveis/${property.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum imóvel cadastrado</h3>
          <p className="text-muted-foreground mb-4">
            Comece adicionando seu primeiro imóvel
          </p>
          <Button onClick={handleAddProperty}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeiro Imóvel
          </Button>
        </div>
      )}

      <UpgradeDialog 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog} 
      />
    </div>
  );
};

export default Properties;

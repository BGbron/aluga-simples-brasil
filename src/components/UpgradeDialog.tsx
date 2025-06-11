
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Crown, Loader2 } from "lucide-react";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpgradeDialog = ({ open, onOpenChange }: UpgradeDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    // Usar o link direto do Stripe fornecido
    window.location.href = "https://buy.stripe.com/test_bJeaEP1LC1FN7I3byiaEE00";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade para Premium
          </DialogTitle>
          <DialogDescription>
            Libere todo o potencial da plataforma
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">R$ 49,90</div>
              <div className="text-sm text-gray-600">por mês</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">O que você ganha:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Imóveis ilimitados</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Inquilinos ilimitados</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Relatórios avançados</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Suporte prioritário</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleUpgrade} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecionando...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                Assinar Premium
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Cancele quando quiser. Sem taxas de cancelamento.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;

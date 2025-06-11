
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteTenantDialogProps {
  tenantId: string;
  tenantName: string;
  onSuccess: () => void;
}

const DeleteTenantDialog = ({ tenantId, tenantName, onSuccess }: DeleteTenantDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteTenant = async () => {
    setIsDeleting(true);
    
    try {
      // Primeiro, deletar todos os pagamentos associados ao inquilino
      const { error: paymentsError } = await supabase
        .from('payments')
        .delete()
        .eq('tenant_id', tenantId);

      if (paymentsError) {
        throw paymentsError;
      }

      // Depois, deletar o inquilino
      const { error: tenantError } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (tenantError) {
        throw tenantError;
      }

      // Atualizar o status da propriedade para disponível
      const { error: propertyError } = await supabase
        .from('properties')
        .update({ status: 'available', tenant_id: null })
        .eq('tenant_id', tenantId);

      if (propertyError) {
        console.warn('Erro ao atualizar propriedade:', propertyError);
      }

      toast({
        title: "Inquilino excluído com sucesso!",
        description: "O inquilino e todos os seus pagamentos foram removidos.",
      });

      onSuccess();
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast({
        title: "Erro ao excluir inquilino.",
        description: "Não foi possível excluir o inquilino. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir Inquilino
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o inquilino "{tenantName}"? Esta ação não pode ser desfeita.
            Todos os pagamentos associados a este inquilino também serão removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteTenant} 
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTenantDialog;

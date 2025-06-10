
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface PaymentStatusSelectProps {
  status: "pending" | "paid" | "overdue";
  onStatusChange: (status: "pending" | "paid" | "overdue") => void;
}

const PaymentStatusSelect = ({ status, onStatusChange }: PaymentStatusSelectProps) => {
  const getStatusBadge = (status: "pending" | "paid" | "overdue") => {
    switch (status) {
      case "paid":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Pago</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "overdue":
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <Select value={status} onValueChange={onStatusChange}>
      <SelectTrigger className="w-[130px]">
        <SelectValue>
          {getStatusBadge(status)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>
        </SelectItem>
        <SelectItem value="paid">
          <Badge variant="secondary" className="bg-green-100 text-green-800">Pago</Badge>
        </SelectItem>
        <SelectItem value="overdue">
          <Badge variant="destructive">Atrasado</Badge>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default PaymentStatusSelect;

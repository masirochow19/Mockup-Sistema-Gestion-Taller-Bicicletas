import { Button } from "./ui/button";
import { Printer, Tag } from "lucide-react";
import { handlePrintLabel, handlePrintVoucher } from "../../lib/orderActions";

interface PrintSectionProps {
  formData: any;
  orderNumber: string;
}

export function PrintSection({ formData, orderNumber }: PrintSectionProps) {
  // Ensure formData has orderNumber populated if it's passed as prop separately
  const formWithOrder = { ...formData, orderNumber };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
        <div className="w-1 h-6 bg-emerald-500 rounded" />
        <Printer className="w-5 h-5 text-emerald-600" />
        Impresiones
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button 
          type="button"
          variant="outline"
          onClick={() => handlePrintLabel(formWithOrder)}
          className="h-auto py-4 flex-col gap-2"
        >
          <Tag className="w-5 h-5" />
          <div>
            <div>Imprimir Etiqueta</div>
            <div className="text-xs text-gray-500 font-normal">Para pegar en la bicicleta</div>
          </div>
        </Button>

        <Button 
          type="button"
          variant="outline"
          onClick={() => handlePrintVoucher(formWithOrder)}
          className="h-auto py-4 flex-col gap-2"
        >
          <Printer className="w-5 h-5" />
          <div>
            <div>Imprimir Voucher</div>
            <div className="text-xs text-gray-500 font-normal">Comprobante para el cliente</div>
          </div>
        </Button>
      </div>
    </div>
  );
}


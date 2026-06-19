import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { CheckCircle2, Printer, Tag, MessageCircle, Mail, PlusCircle } from "lucide-react";
import { handlePrintLabel, handlePrintVoucher, handleSendWhatsApp, handleSendEmail } from "../../lib/orderActions";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: () => void;
  savedOrder: any | null;
}

export function SuccessModal({ isOpen, onClose, onNewOrder, savedOrder }: SuccessModalProps) {
  if (!savedOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] text-center">
        <DialogHeader className="flex flex-col items-center sm:text-center mt-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            ¡Orden Guardada Exitosamente!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            La orden <strong>#{savedOrder.orderNumber}</strong> para {savedOrder.clientName} ha sido registrada. ¿Qué deseas hacer ahora?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-6 mb-4">
          <Button 
            variant="outline" 
            onClick={() => handlePrintLabel(savedOrder)}
            className="h-auto py-4 flex-col gap-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          >
            <Tag className="w-6 h-6 text-gray-700" />
            <span>Imprimir Etiqueta</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => handlePrintVoucher(savedOrder)}
            className="h-auto py-4 flex-col gap-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          >
            <Printer className="w-6 h-6 text-gray-700" />
            <span>Imprimir Voucher</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => handleSendWhatsApp(savedOrder)}
            className="h-auto py-4 flex-col gap-2 border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
          >
            <MessageCircle className="w-6 h-6 text-green-600" />
            <span>Enviar WhatsApp</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => handleSendEmail(savedOrder)}
            className="h-auto py-4 flex-col gap-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700"
          >
            <Mail className="w-6 h-6 text-blue-600" />
            <span>Enviar Correo</span>
          </Button>
        </div>

        <DialogFooter className="sm:justify-center border-t border-gray-100 pt-6 mt-2">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cerrar e Ir al Panel
          </Button>
          <Button 
            onClick={onNewOrder}
            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Crear Nueva Orden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { MessageCircle, Mail, Send } from "lucide-react";
import { toast } from "sonner";

interface NotificationsSectionProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export function NotificationsSection({ formData, updateFormData }: NotificationsSectionProps) {
  const defaultMessage = `Hola ${formData.clientName || '[Cliente]'}, 

Te informamos que tu bicicleta ${formData.bikeBrand || '[Marca]'} ${formData.bikeModel || '[Modelo]'} ya está lista para ser retirada en nuestro taller.

Orden: ${formData.orderNumber || '[N° Orden]'}
Total a pagar: $${(parseFloat(formData.maintenancePrice || 0) + formData.parts.reduce((sum: number, part: any) => sum + (part.quantity * part.price), 0)).toLocaleString('es-CL')} CLP

¡Gracias por confiar en nosotros!`;

  const handleSendWhatsApp = () => {
    if (!formData.phone) {
      toast.error('No hay número de teléfono registrado');
      return;
    }
    
    const message = encodeURIComponent(formData.notificationMessage || defaultMessage);
    const phoneNumber = formData.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    toast.success('Abriendo WhatsApp...');
  };

  const handleSendEmail = () => {
    if (!formData.email) {
      toast.error('No hay correo electrónico registrado');
      return;
    }
    
    const subject = encodeURIComponent(`Bicicleta lista para retiro - Orden ${formData.orderNumber || 'N/A'}`);
    const body = encodeURIComponent(formData.notificationMessage || defaultMessage);
    window.open(`mailto:${formData.email}?subject=${subject}&body=${body}`, '_blank');
    toast.success('Abriendo cliente de correo...');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
        <div className="w-1 h-6 bg-emerald-500 rounded" />
        Notificaciones Automáticas
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="notificationMessage">Mensaje de Notificación (Editable)</Label>
          <Textarea
            id="notificationMessage"
            value={formData.notificationMessage || defaultMessage}
            onChange={(e) => updateFormData('notificationMessage', e.target.value)}
            rows={6}
            placeholder={defaultMessage}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            type="button"
            onClick={handleSendWhatsApp}
            className="bg-green-600 hover:bg-green-700 h-auto py-3"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div>Enviar por WhatsApp</div>
              <div className="text-xs font-normal opacity-90">{formData.phone || 'Sin teléfono'}</div>
            </div>
          </Button>

          <Button 
            type="button"
            onClick={handleSendEmail}
            className="bg-blue-600 hover:bg-blue-700 h-auto py-3"
          >
            <Mail className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div>Enviar por Correo</div>
              <div className="text-xs font-normal opacity-90">{formData.email || 'Sin correo'}</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}

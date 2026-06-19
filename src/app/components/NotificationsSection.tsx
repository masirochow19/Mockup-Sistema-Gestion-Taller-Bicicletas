import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { MessageCircle, Mail } from "lucide-react";
import { handleSendWhatsApp, handleSendEmail, generateNotificationMessage } from "../../lib/orderActions";
import { useEffect } from "react";

interface NotificationsSectionProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export function NotificationsSection({ formData, updateFormData }: NotificationsSectionProps) {
  const defaultMessage = generateNotificationMessage(formData);

  // Initialize notification message if empty
  useEffect(() => {
    if (!formData.notificationMessage) {
      updateFormData('notificationMessage', defaultMessage);
    }
  }, [formData.clientName, formData.bikeBrand, formData.bikeModel, formData.maintenancePrice, formData.parts]);

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
            onClick={() => handleSendWhatsApp(formData, formData.notificationMessage)}
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
            onClick={() => handleSendEmail(formData, formData.notificationMessage)}
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


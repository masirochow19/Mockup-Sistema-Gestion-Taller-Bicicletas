import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { AlertCircle, Clock, Wrench, CheckCircle } from "lucide-react";

interface StatusSectionProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

const statusConfig = {
  'en-revision': { 
    label: 'En Revisión', 
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: AlertCircle
  },
  'en-reparacion': { 
    label: 'En Reparación', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: Wrench
  },
  'esperando-repuestos': { 
    label: 'Esperando Repuestos', 
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: Clock
  },
  'listo-retiro': { 
    label: 'Listo para Retiro', 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: CheckCircle
  },
  'entregado': { 
    label: 'Entregado', 
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: CheckCircle
  },
  'cancelado': { 
    label: 'Cancelado', 
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: AlertCircle
  }
};

export function StatusSection({ formData, updateFormData }: StatusSectionProps) {
  const currentStatus = statusConfig[formData.status as keyof typeof statusConfig];
  const StatusIcon = currentStatus?.icon || Clock;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
        <div className="w-1 h-6 bg-emerald-500 rounded" />
        Estado del Trabajo
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="status">Estado Actual</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => updateFormData('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-2">
          <Label className="mb-2 block">Indicador Visual:</Label>
          <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg border-2 ${currentStatus?.color}`}>
            <StatusIcon className="w-5 h-5" />
            <span className="font-medium">{currentStatus?.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

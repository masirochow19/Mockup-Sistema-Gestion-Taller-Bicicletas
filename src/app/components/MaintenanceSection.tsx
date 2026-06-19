import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Wrench } from "lucide-react";

interface MaintenanceSectionProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export function MaintenanceSection({ formData, updateFormData }: MaintenanceSectionProps) {
  const toggleMaintenance = (type: string) => {
    const updated = formData.maintenanceTypes.includes(type)
      ? formData.maintenanceTypes.filter((t: string) => t !== type)
      : [...formData.maintenanceTypes, type];
    updateFormData('maintenanceTypes', updated);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
        <div className="w-1 h-6 bg-emerald-500 rounded" />
        <Wrench className="w-5 h-5 text-emerald-600" />
        Tipo de Mantención
      </h2>
      
      <div className="mb-4">
        <Label className="mb-3 block">Seleccione los servicios requeridos:</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { id: 'basica', label: 'Mantención Básica' },
            { id: 'completa', label: 'Mantención Completa' },
            { id: 'frenos', label: 'Ajuste de Frenos' },
            { id: 'cambios', label: 'Ajuste de Cambios' },
            { id: 'limpieza', label: 'Limpieza Profunda' },
            { id: 'revision', label: 'Revisión General' },
          ].map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={formData.maintenanceTypes.includes(item.id)}
                onCheckedChange={() => toggleMaintenance(item.id)}
              />
              <label
                htmlFor={item.id}
                className="text-sm cursor-pointer select-none"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="workDetails">Detalle del Trabajo a Realizar *</Label>
        <Textarea
          id="workDetails"
          value={formData.workDetails}
          onChange={(e) => updateFormData('workDetails', e.target.value)}
          placeholder="Describa detalladamente el trabajo a realizar, problemas detectados, etc."
          rows={4}
        />
      </div>
    </div>
  );
}

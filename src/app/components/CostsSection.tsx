import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { DollarSign } from "lucide-react";

interface CostsSectionProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  totalParts: number;
}

export function CostsSection({ formData, updateFormData, totalParts }: CostsSectionProps) {
  const totalService = parseFloat(formData.maintenancePrice || 0) + totalParts;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
        <div className="w-1 h-6 bg-emerald-500 rounded" />
        <DollarSign className="w-5 h-5 text-emerald-600" />
        Costos del Servicio
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maintenancePrice">Valor de la Mantención (CLP)</Label>
            <Input
              id="maintenancePrice"
              type="number"
              min="0"
              value={formData.maintenancePrice}
              onChange={(e) => updateFormData('maintenancePrice', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label>Total Repuestos (CLP)</Label>
            <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md flex items-center text-gray-700">
              ${totalParts.toLocaleString('es-CL')}
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-900">Total Final del Servicio:</span>
              <span className="text-2xl text-emerald-700">
                ${totalService.toLocaleString('es-CL')} CLP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

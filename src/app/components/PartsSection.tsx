import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Part {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface PartsSectionProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export function PartsSection({ formData, updateFormData }: PartsSectionProps) {
  const addPart = () => {
    const newPart: Part = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      price: 0
    };
    updateFormData('parts', [...formData.parts, newPart]);
  };

  const removePart = (id: string) => {
    updateFormData('parts', formData.parts.filter((p: Part) => p.id !== id));
  };

  const updatePart = (id: string, field: keyof Part, value: any) => {
    updateFormData('parts', formData.parts.map((p: Part) => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const totalParts = formData.parts.reduce((sum: number, part: Part) => 
    sum + (part.quantity * part.price), 0
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
        <div className="w-1 h-6 bg-emerald-500 rounded" />
        Repuestos
      </h2>
      
      <div className="mb-4">
        <Label>¿Se utilizarán repuestos?</Label>
        <RadioGroup
          value={formData.useParts}
          onValueChange={(value) => updateFormData('useParts', value)}
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="parts-yes" />
            <Label htmlFor="parts-yes" className="font-normal cursor-pointer">Sí</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="parts-no" />
            <Label htmlFor="parts-no" className="font-normal cursor-pointer">No</Label>
          </div>
        </RadioGroup>
      </div>

      {formData.useParts === 'yes' && (
        <div>
          <div className="mb-3">
            <Button 
              type="button" 
              onClick={addPart} 
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Repuesto
            </Button>
          </div>

          {formData.parts.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">Repuesto</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">Cantidad</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">Valor Unitario</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">Subtotal</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.parts.map((part: Part) => (
                    <tr key={part.id} className="border-b last:border-b-0">
                      <td className="px-4 py-2">
                        <Input
                          value={part.name}
                          onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                          placeholder="Nombre del repuesto"
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          min="1"
                          value={part.quantity}
                          onChange={(e) => updatePart(part.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="h-8 w-20"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          min="0"
                          value={part.price}
                          onChange={(e) => updatePart(part.id, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="h-8 w-28"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">
                        ${(part.quantity * part.price).toLocaleString('es-CL')}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePart(part.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-2 text-right text-gray-700">
                      Total Repuestos:
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-emerald-700">${totalParts.toLocaleString('es-CL')}</span>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

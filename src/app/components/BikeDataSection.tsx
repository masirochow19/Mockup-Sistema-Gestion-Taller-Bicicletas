import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Bike } from "lucide-react";

interface BikeDataSectionProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export function BikeDataSection({ formData, updateFormData }: BikeDataSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
        <div className="w-1 h-6 bg-emerald-500 rounded" />
        <Bike className="w-5 h-5 text-emerald-600" />
        Datos de la Bicicleta
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Marca *</Label>
          <Input
            id="brand"
            value={formData.bikeBrand}
            onChange={(e) => updateFormData('bikeBrand', e.target.value)}
            placeholder="Ej: Trek, Giant, Specialized"
          />
        </div>
        <div>
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            value={formData.bikeModel}
            onChange={(e) => updateFormData('bikeModel', e.target.value)}
            placeholder="Ej: Marlin 7"
          />
        </div>
        <div>
          <Label htmlFor="bikeType">Tipo de Bicicleta *</Label>
          <Select 
            value={formData.bikeType} 
            onValueChange={(value) => updateFormData('bikeType', value)}
          >
            <SelectTrigger id="bikeType">
              <SelectValue placeholder="Seleccione tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ruta">Ruta</SelectItem>
              <SelectItem value="mtb">MTB (Mountain Bike)</SelectItem>
              <SelectItem value="urbana">Urbana</SelectItem>
              <SelectItem value="electrica">Eléctrica</SelectItem>
              <SelectItem value="gravel">Gravel</SelectItem>
              <SelectItem value="bmx">BMX</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={formData.bikeColor}
            onChange={(e) => updateFormData('bikeColor', e.target.value)}
            placeholder="Ej: Rojo, Negro mate"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="observations">Observaciones Generales</Label>
          <Textarea
            id="observations"
            value={formData.observations}
            onChange={(e) => updateFormData('observations', e.target.value)}
            placeholder="Ej: Rayones en el cuadro, stickers personalizados, etc."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

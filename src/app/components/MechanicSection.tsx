import { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { UserCog, Plus, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface Mechanic {
  id: string;
  name: string;
  active: boolean;
}

interface MechanicSectionProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export function MechanicSection({ formData, updateFormData }: MechanicSectionProps) {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMechanics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mechanics')
        .select('id, name, active')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      setMechanics(data || []);
    } catch (error: any) {
      toast.error('Error al cargar mecánicos', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMechanics(); }, []);

  const handleAddMechanic = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('mechanics')
        .insert({ name: newName.trim(), active: true })
        .select('id, name, active')
        .single();
      if (error) throw error;
      setMechanics(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      updateFormData('mechanic', data.name);
      updateFormData('mechanicId', data.id);
      setNewName('');
      setAddingNew(false);
      toast.success('Mecánico agregado', { description: `${data.name} ya está disponible` });
    } catch (error: any) {
      toast.error('Error al agregar mecánico', { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
        <div className="w-1 h-6 bg-emerald-500 rounded" />
        <UserCog className="w-5 h-5 text-emerald-600" />
        Mecánico Asignado
      </h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="mechanic">Nombre del Mecánico Responsable</Label>
          <div className="flex gap-2 mt-1">
            {loading ? (
              <div className="flex-1 flex items-center gap-2 h-10 px-3 border border-gray-200 rounded-md text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando mecánicos...
              </div>
            ) : (
              <Select
                value={formData.mechanic}
                onValueChange={(value) => {
                  updateFormData('mechanic', value);
                  const found = mechanics.find(m => m.name === value);
                  if (found) updateFormData('mechanicId', found.id);
                }}
              >
                <SelectTrigger id="mechanic" className="flex-1">
                  <SelectValue placeholder="Seleccione un mecánico..." />
                </SelectTrigger>
                <SelectContent>
                  {mechanics.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">
                      No hay mecánicos registrados
                    </div>
                  ) : (
                    mechanics.map(m => (
                      <SelectItem key={m.id} value={m.name}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          {m.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddingNew(!addingNew)}
              className="h-10 border-emerald-300 text-emerald-700 hover:bg-emerald-50 whitespace-nowrap"
              title="Agregar nuevo mecánico"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nuevo
            </Button>
          </div>

          {addingNew && (
            <div className="mt-2 flex gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg animate-in slide-in-from-top-1">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nombre del nuevo mecánico"
                className="flex-1 px-3 py-1.5 text-sm border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                onKeyDown={e => e.key === 'Enter' && handleAddMechanic()}
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 h-8"
                onClick={handleAddMechanic}
                disabled={saving || !newName.trim()}
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Guardar'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 text-gray-500"
                onClick={() => { setAddingNew(false); setNewName(''); }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="technicalComments">Comentarios Técnicos Internos</Label>
          <Textarea
            id="technicalComments"
            value={formData.technicalComments}
            onChange={(e) => updateFormData('technicalComments', e.target.value)}
            placeholder="Notas técnicas, observaciones especiales, problemas encontrados durante la revisión..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

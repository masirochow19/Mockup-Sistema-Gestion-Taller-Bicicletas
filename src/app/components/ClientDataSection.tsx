import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Phone, Mail, UserCheck, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface ClientDataSectionProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  rutError: string;
}

export function ClientDataSection({ formData, updateFormData, rutError }: ClientDataSectionProps) {
  const [lookingUp, setLookingUp] = useState(false);
  const [clientFound, setClientFound] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autocompletado de cliente por RUT
  useEffect(() => {
    const rut = formData.rut?.replace(/\./g, '').replace(/-/g, '');
    if (!rut || rut.length < 7) {
      setClientFound(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLookingUp(true);
      try {
        const { data } = await supabase
          .from('clients')
          .select('name, phone, email, contact_preference')
          .eq('rut', formData.rut)
          .maybeSingle();

        if (data) {
          updateFormData('clientName', data.name);
          updateFormData('phone', data.phone);
          updateFormData('email', data.email || '');
          updateFormData('contactPreference', data.contact_preference || 'whatsapp');
          setClientFound(true);
          toast.success('Cliente encontrado', { description: `Datos de ${data.name} cargados automáticamente` });
        } else {
          setClientFound(false);
        }
      } catch {
        setClientFound(false);
      } finally {
        setLookingUp(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.rut]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <h2 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
        <div className="w-1 h-6 bg-emerald-500 rounded" />
        Datos del Cliente
        {clientFound && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full animate-in fade-in">
            <UserCheck className="w-3.5 h-3.5" />
            Cliente registrado
          </span>
        )}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">Nombre Completo *</Label>
          <Input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => updateFormData('clientName', e.target.value)}
            placeholder="Ej: Juan Pérez González"
            className={clientFound ? 'border-emerald-300 bg-emerald-50/30' : ''}
          />
        </div>
        <div>
          <Label htmlFor="rut">
            RUT *
            {lookingUp && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-400 font-normal">
                <Loader2 className="w-3 h-3 animate-spin" />
                Buscando...
              </span>
            )}
          </Label>
          <Input
            id="rut"
            value={formData.rut}
            onChange={(e) => updateFormData('rut', e.target.value)}
            placeholder="12.345.678-9"
            className={
              rutError
                ? 'border-red-400 focus:ring-red-300'
                : clientFound
                ? 'border-emerald-300 bg-emerald-50/30'
                : ''
            }
          />
          {rutError && <p className="text-sm text-red-500 mt-1">{rutError}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Teléfono *</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
              <Phone className="w-4 h-4" />
            </span>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              placeholder="+56 9 1234 5678"
              className={`rounded-l-none ${clientFound ? 'border-emerald-300 bg-emerald-50/30' : ''}`}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Correo Electrónico</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
              <Mail className="w-4 h-4" />
            </span>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              placeholder="cliente@ejemplo.com"
              className={`rounded-l-none ${clientFound ? 'border-emerald-300 bg-emerald-50/30' : ''}`}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <Label>Preferencia de Contacto</Label>
          <RadioGroup
            value={formData.contactPreference}
            onValueChange={(value) => updateFormData('contactPreference', value)}
            className="flex gap-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="whatsapp" id="whatsapp" />
              <Label htmlFor="whatsapp" className="font-normal cursor-pointer">WhatsApp</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email-pref" />
              <Label htmlFor="email-pref" className="font-normal cursor-pointer">Correo Electrónico</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="llamada" id="llamada-pref" />
              <Label htmlFor="llamada-pref" className="font-normal cursor-pointer">Llamada Telefónica</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

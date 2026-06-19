import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BicicletasLogo } from './components/BicicletasLogo';
import { ClientDataSection } from './components/ClientDataSection';
import { BikeDataSection } from './components/BikeDataSection';
import { MaintenanceSection } from './components/MaintenanceSection';
import { PartsSection } from './components/PartsSection';
import { MechanicSection } from './components/MechanicSection';
import { CostsSection } from './components/CostsSection';
import { StatusSection } from './components/StatusSection';
import { PrintSection } from './components/PrintSection';
import { NotificationsSection } from './components/NotificationsSection';
import { OrdersModal } from './components/OrdersModal';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/ui/button';
import {
  Save, RefreshCw, Printer, X, FileText,
  LayoutDashboard, ClipboardList, ChevronRight
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Part {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface FormData {
  orderNumber: string;
  entryDate: string;
  clientName: string;
  rut: string;
  phone: string;
  email: string;
  contactPreference: string;
  bikeBrand: string;
  bikeModel: string;
  bikeType: string;
  bikeColor: string;
  observations: string;
  maintenanceTypes: string[];
  workDetails: string;
  useParts: string;
  parts: Part[];
  mechanic: string;
  mechanicId: string;
  technicalComments: string;
  maintenancePrice: string;
  status: string;
  notificationMessage: string;
  // Internal DB IDs for updates
  _orderId?: string;
}

const EMPTY_FORM: Omit<FormData, 'orderNumber' | 'entryDate'> = {
  clientName: '',
  rut: '',
  phone: '',
  email: '',
  contactPreference: 'whatsapp',
  bikeBrand: '',
  bikeModel: '',
  bikeType: '',
  bikeColor: '',
  observations: '',
  maintenanceTypes: [],
  workDetails: '',
  useParts: 'no',
  parts: [],
  mechanic: '',
  mechanicId: '',
  technicalComments: '',
  maintenancePrice: '',
  status: 'en-revision',
  notificationMessage: '',
};

type View = 'dashboard' | 'form';

function generateOrderNumber() {
  return `BK-${Date.now().toString().slice(-6)}`;
}

function todayFormatted() {
  return new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [formData, setFormData] = useState<FormData>({
    orderNumber: generateOrderNumber(),
    entryDate: todayFormatted(),
    ...EMPTY_FORM,
  });
  const [rutError, setRutError] = useState('');
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'rut') validateRut(value);
  };

  const validateRut = (rut: string) => {
    const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');
    if (!cleanRut) { setRutError(''); return false; }
    if (cleanRut.length < 2) { setRutError('RUT incompleto'); return false; }

    const rutBody = cleanRut.slice(0, -1);
    const rutDv = cleanRut.slice(-1).toUpperCase();
    let suma = 0;
    let multiplicador = 2;

    for (let i = rutBody.length - 1; i >= 0; i--) {
      suma += parseInt(rutBody.charAt(i)) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvCalculado = 11 - (suma % 11);
    const dvFinal = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'K' : dvCalculado.toString();

    if (dvFinal !== rutDv) { setRutError('RUT inválido'); return false; }
    setRutError('');
    return true;
  };

  const resetForm = () => {
    setFormData({
      orderNumber: generateOrderNumber(),
      entryDate: todayFormatted(),
      ...EMPTY_FORM,
    });
    setRutError('');
  };

  const handleSave = async () => {
    if (!formData.clientName) { toast.error('Ingrese el nombre del cliente'); return; }
    if (!formData.rut || rutError) { toast.error('Ingrese un RUT válido'); return; }
    if (!formData.phone) { toast.error('Ingrese el teléfono del cliente'); return; }
    if (!formData.bikeBrand) { toast.error('Ingrese la marca de la bicicleta'); return; }
    if (!formData.bikeType) { toast.error('Seleccione el tipo de bicicleta'); return; }
    if (!formData.workDetails) { toast.error('Detalle el trabajo a realizar'); return; }

    setIsSaving(true);
    try {
      // 1. Guardar o actualizar Cliente
      let clientId: string;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('rut', formData.rut)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
        await supabase.from('clients').update({
          name: formData.clientName,
          phone: formData.phone,
          email: formData.email,
          contact_preference: formData.contactPreference,
        }).eq('id', clientId);
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            rut: formData.rut,
            name: formData.clientName,
            phone: formData.phone,
            email: formData.email,
            contact_preference: formData.contactPreference,
          })
          .select('id')
          .single();
        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // 2. Guardar Bicicleta
      const { data: bikeData, error: bikeError } = await supabase
        .from('bikes')
        .insert({
          client_id: clientId,
          brand: formData.bikeBrand,
          model: formData.bikeModel,
          type: formData.bikeType,
          color: formData.bikeColor,
          observations: formData.observations,
        })
        .select('id')
        .single();
      if (bikeError) throw bikeError;

      // 3. Obtener / crear mecánico
      let mechanicId: string | null = null;
      if (formData.mechanic) {
        if (formData.mechanicId) {
          mechanicId = formData.mechanicId;
        } else {
          const { data: existingMechanic } = await supabase
            .from('mechanics')
            .select('id')
            .eq('name', formData.mechanic)
            .maybeSingle();
          if (existingMechanic) {
            mechanicId = existingMechanic.id;
          } else {
            const { data: newMechanic, error: mechanicError } = await supabase
              .from('mechanics')
              .insert({ name: formData.mechanic })
              .select('id')
              .single();
            if (mechanicError) throw mechanicError;
            mechanicId = newMechanic.id;
          }
        }
      }

      // 4. Guardar Orden de Servicio
      const { data: orderData, error: orderError } = await supabase
        .from('service_orders')
        .insert({
          order_number: formData.orderNumber,
          client_id: clientId,
          bike_id: bikeData.id,
          mechanic_id: mechanicId,
          work_details: formData.workDetails,
          technical_comments: formData.technicalComments,
          maintenance_price: formData.maintenancePrice ? parseFloat(formData.maintenancePrice) : null,
          status: formData.status,
          notification_message: formData.notificationMessage,
        })
        .select('id')
        .single();
      if (orderError) throw orderError;

      // 5. Guardar Repuestos
      if (formData.useParts === 'yes' && formData.parts.length > 0) {
        const partsToInsert = formData.parts.map(part => ({
          service_order_id: orderData.id,
          name: part.name,
          quantity: part.quantity,
          price: part.price,
        }));
        const { error: partsError } = await supabase
          .from('service_order_parts')
          .insert(partsToInsert);
        if (partsError) throw partsError;
      }

      toast.success('✅ Orden guardada exitosamente', {
        description: `Orden ${formData.orderNumber} registrada en base de datos`,
      });

      resetForm();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar la orden', {
        description: error.message || 'Ocurrió un problema de conexión con la base de datos',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!formData._orderId) {
      toast.error('Esta orden aún no tiene ID de base de datos', {
        description: 'Guarda la orden primero, luego actualiza el estado',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', formData._orderId);

      if (error) throw error;
      toast.success('Estado actualizado en la base de datos');
    } catch (error: any) {
      toast.error('Error al actualizar estado', { description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (confirm('¿Cerrar esta orden? Los cambios no guardados se perderán.')) {
      resetForm();
      setView('dashboard');
    }
  };

  const totalParts = formData.parts.reduce((sum, part) => sum + part.quantity * part.price, 0);

  const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'form', label: 'Nueva Orden', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-emerald-50/30">
      <Toaster position="top-right" richColors expand={false} />

      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 via-slate-750 to-slate-700 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <BicicletasLogo />
              </div>
              <div>
                <h1 className="text-white font-bold text-base leading-tight">
                  Taller de Bicicletas
                </h1>
                <p className="text-emerald-400 text-xs leading-tight">Sistema de Gestión</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    view === item.id
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowOrdersModal(true)}
                variant="outline"
                size="sm"
                className="border-slate-500 text-slate-200 hover:bg-white/10 hover:text-white hover:border-slate-400 bg-transparent h-9"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Órdenes
              </Button>
              <div className="text-right border-l border-slate-600 pl-3">
                <div className="text-xs text-slate-400">Fecha</div>
                <div className="text-sm text-white font-medium">{formData.entryDate}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === 'dashboard' ? (
          <Dashboard onNewOrder={() => setView('form')} />
        ) : (
          <div className="space-y-6">
            {/* Order header bar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button
                  onClick={() => setView('dashboard')}
                  className="hover:text-emerald-600 transition-colors font-medium"
                >
                  Dashboard
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-semibold">Nueva Orden</span>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-gray-400">Orden N°</div>
                  <div className="text-lg font-bold text-emerald-600 font-mono">{formData.orderNumber}</div>
                </div>
                <div className="h-10 w-px bg-gray-200" />
                <div className="text-right">
                  <div className="text-xs text-gray-400">Ingreso</div>
                  <div className="text-sm font-semibold text-gray-700">{formData.entryDate}</div>
                </div>
              </div>
            </div>

            {/* Form sections */}
            <ClientDataSection
              formData={formData}
              updateFormData={updateFormData}
              rutError={rutError}
            />
            <BikeDataSection formData={formData} updateFormData={updateFormData} />
            <MaintenanceSection formData={formData} updateFormData={updateFormData} />
            <PartsSection formData={formData} updateFormData={updateFormData} />
            <MechanicSection formData={formData} updateFormData={updateFormData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CostsSection formData={formData} updateFormData={updateFormData} totalParts={totalParts} />
              <StatusSection formData={formData} updateFormData={updateFormData} />
            </div>

            <PrintSection formData={formData} orderNumber={formData.orderNumber} />
            <NotificationsSection formData={formData} updateFormData={updateFormData} />

            {/* Final Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg mb-5 text-gray-900 flex items-center gap-2 font-semibold">
                <div className="w-1 h-6 bg-emerald-500 rounded" />
                Acciones Finales
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 h-12 shadow-lg shadow-emerald-500/20 font-semibold"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? 'Guardando...' : 'Guardar Orden'}
                </Button>

                <Button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  variant="outline"
                  className="h-12 border-blue-300 text-blue-700 hover:bg-blue-50 font-medium"
                >
                  {isUpdating ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Actualizar Estado
                </Button>

                <Button
                  onClick={() => toast.info('Usa los botones de impresión en las secciones anteriores')}
                  variant="outline"
                  className="h-12"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Docs
                </Button>

                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="h-12 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cerrar Orden
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-sm text-gray-500">
          <span>Sistema de Gestión de Taller de Bicicletas © 2026</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Conectado a Supabase
          </span>
        </div>
      </footer>

      {/* Orders Modal */}
      <OrdersModal
        open={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        onLoadOrder={(order) => {
          setFormData(prev => ({
            ...prev,
            orderNumber: order.order_number,
            clientName: order.clients?.name ?? '',
            phone: order.clients?.phone ?? '',
            email: order.clients?.email ?? '',
            contactPreference: order.clients?.contact_preference ?? 'whatsapp',
            bikeBrand: order.bikes?.brand ?? '',
            bikeModel: order.bikes?.model ?? '',
            bikeType: order.bikes?.type ?? '',
            bikeColor: order.bikes?.color ?? '',
            mechanic: order.mechanics?.name ?? '',
            status: order.status,
            _orderId: order.id,
          }));
          setView('form');
          toast.info('Orden cargada', { description: `Orden ${order.order_number} lista para editar` });
        }}
      />
    </div>
  );
}

export default App;
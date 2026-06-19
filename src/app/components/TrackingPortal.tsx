import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Bike, Clock, Wrench, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function TrackingPortal() {
  const [orderNumber, setOrderNumber] = useState('');
  const [rut, setRut] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !rut) {
      setError('Por favor ingresa el número de orden y tu RUT');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          clients (name, rut),
          bikes (brand, model)
        `)
        .eq('order_number', orderNumber)
        .eq('clients.rut', rut)
        .single();

      if (error || !data) {
        throw new Error('No se encontró la orden. Verifica los datos.');
      }

      // Supabase inner joins sometimes return null for the relation if it doesn't match
      if (!data.clients) {
        throw new Error('No se encontró la orden con ese RUT.');
      }

      setOrderData(data);
    } catch (err: any) {
      setError(err.message || 'Error al buscar la orden');
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 'en-revision', label: 'En Revisión', icon: Search },
    { id: 'en-reparacion', label: 'En Reparación', icon: Wrench },
    { id: 'esperando-repuestos', label: 'Esperando Repuestos', icon: Clock },
    { id: 'listo-retiro', label: 'Listo para Retiro', icon: CheckCircle2 },
    { id: 'entregado', label: 'Entregado', icon: CheckCircle2 }
  ];

  const getStepIndex = (status: string) => {
    return steps.findIndex(s => s.id === status);
  };

  const currentStepIndex = orderData ? getStepIndex(orderData.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-6 text-center">
        <h1 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Bike className="text-emerald-600" />
          Taller de Bicicletas
        </h1>
        <p className="text-sm text-gray-500 mt-1">Portal de Seguimiento</p>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto p-6">
        {!orderData ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Rastrear mi Bicicleta</h2>
            <form onSubmit={handleSearch} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Orden</label>
                <Input 
                  placeholder="Ej: ORD-12345" 
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  className="h-12 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                <Input 
                  placeholder="Ej: 12.345.678-9" 
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-medium bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? 'Buscando...' : 'Buscar Orden'}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <Button 
              variant="ghost" 
              onClick={() => setOrderData(null)}
              className="text-gray-500 hover:text-gray-900 -ml-2"
            >
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Volver a buscar
            </Button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                <div>
                  <div className="text-sm text-gray-500">Orden de Servicio</div>
                  <div className="text-2xl font-bold text-gray-900">#{orderData.order_number}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Bicicleta</div>
                  <div className="font-medium text-gray-900">{orderData.bikes.brand} {orderData.bikes.model}</div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-100"></div>
                
                <div className="space-y-8 relative">
                  {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.id} className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                          isCompleted ? 'bg-emerald-100 text-emerald-600' :
                          isCurrent ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-50' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${isCurrent ? 'text-emerald-700 font-bold' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </h4>
                          {isCurrent && orderData.status === 'esperando-repuestos' && (
                            <p className="text-sm text-orange-600 mt-1">Estamos gestionando los repuestos necesarios.</p>
                          )}
                          {isCurrent && orderData.status === 'listo-retiro' && (
                            <p className="text-sm text-emerald-600 mt-1 font-medium">¡Tu bicicleta está lista! Puedes pasar a buscarla.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {orderData.status === 'listo-retiro' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                <div className="text-sm text-emerald-800 font-medium mb-1">Total a Pagar</div>
                <div className="text-3xl font-bold text-emerald-700">
                  ${parseFloat(orderData.maintenance_price || 0).toLocaleString('es-CL')} CLP
                </div>
                <p className="text-xs text-emerald-600 mt-2">+ repuestos adicionales si aplica</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

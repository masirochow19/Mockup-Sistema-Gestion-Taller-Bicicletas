import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { X, FileText, RefreshCw, Search, Filter, ChevronDown, Edit2, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface DbOrder {
  id: string;
  order_number: string;
  entry_date: string;
  status: string;
  work_details: string;
  maintenance_price: number | null;
  technical_comments: string | null;
  notification_message: string | null;
  clients: {
    name: string;
    rut: string;
    phone: string;
    email: string;
    contact_preference: string;
  } | null;
  bikes: {
    brand: string;
    model: string | null;
    type: string;
    color: string | null;
  } | null;
  mechanics: {
    name: string;
  } | null;
  service_order_parts: {
    quantity: number;
    price: number;
  }[];
}

interface OrdersModalProps {
  open: boolean;
  onClose: () => void;
  onLoadOrder?: (order: DbOrder) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  'en-revision':         { label: 'En Revisión',          color: 'text-blue-700',   bg: 'bg-blue-100 border-blue-200',   dot: 'bg-blue-500' },
  'en-reparacion':       { label: 'En Reparación',         color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-200', dot: 'bg-yellow-500' },
  'esperando-repuestos': { label: 'Esperando Repuestos',   color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200', dot: 'bg-orange-500' },
  'listo-retiro':        { label: 'Listo para Retiro',     color: 'text-emerald-700',bg: 'bg-emerald-100 border-emerald-200', dot: 'bg-emerald-500' },
  'entregado':           { label: 'Entregado',             color: 'text-gray-600',   bg: 'bg-gray-100 border-gray-200',   dot: 'bg-gray-400' },
  'cancelado':           { label: 'Cancelado',             color: 'text-red-700',    bg: 'bg-red-100 border-red-200',     dot: 'bg-red-500' },
};

export function OrdersModal({ open, onClose, onLoadOrder }: OrdersModalProps) {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [editingStatusFor, setEditingStatusFor] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          id,
          order_number,
          entry_date,
          status,
          work_details,
          maintenance_price,
          technical_comments,
          notification_message,
          clients ( name, rut, phone, email, contact_preference ),
          bikes ( brand, model, type, color ),
          mechanics ( name ),
          service_order_parts ( quantity, price )
        `)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setOrders((data as unknown as DbOrder[]) || []);
    } catch (error: any) {
      toast.error('Error al cargar órdenes', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchOrders();
  }, [open]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Estado actualizado', { description: statusConfig[newStatus]?.label });
    } catch (error: any) {
      toast.error('Error al actualizar estado', { description: error.message });
    } finally {
      setUpdatingStatus(null);
      setEditingStatusFor(null);
    }
  };

  const calcTotal = (order: DbOrder) => {
    const maintenance = order.maintenance_price ?? 0;
    const parts = order.service_order_parts?.reduce((sum, p) => sum + p.quantity * p.price, 0) ?? 0;
    return maintenance + parts;
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || o.order_number.toLowerCase().includes(q)
      || (o.clients?.name || '').toLowerCase().includes(q)
      || (o.clients?.rut || '').toLowerCase().includes(q)
      || (o.bikes?.brand || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // KPIs
  const kpis = {
    total: orders.length,
    active: orders.filter(o => !['entregado', 'cancelado'].includes(o.status)).length,
    listo: orders.filter(o => o.status === 'listo-retiro').length,
    ingresos: orders.reduce((sum, o) => sum + calcTotal(o), 0),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white text-xl">
              <FileText className="w-6 h-6 text-emerald-400" />
              Panel de Órdenes
              <button
                onClick={fetchOrders}
                className="ml-auto p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Recargar"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </DialogTitle>
          </DialogHeader>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Total Órdenes', value: kpis.total, icon: FileText, color: 'text-blue-300' },
              { label: 'Activas', value: kpis.active, icon: Clock, color: 'text-yellow-300' },
              { label: 'Listas para Retiro', value: kpis.listo, icon: CheckCircle2, color: 'text-emerald-300' },
              { label: 'Ingresos Totales', value: `$${kpis.ingresos.toLocaleString('es-CL')}`, icon: TrendingUp, color: 'text-purple-300' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  <span className="text-xs text-slate-300">{kpi.label}</span>
                </div>
                <div className="text-xl font-bold text-white">{kpi.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b bg-gray-50 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por orden, cliente, RUT, marca..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500 ml-auto">{filtered.length} resultado(s)</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-gray-500">Cargando órdenes desde la base de datos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-200" />
              <p className="text-gray-500 text-lg">No se encontraron órdenes</p>
              <p className="text-gray-400 text-sm mt-1">Intenta cambiar los filtros o registra una nueva orden</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['N° Orden', 'Fecha', 'Cliente', 'Bicicleta', 'Mecánico', 'Estado', 'Total', 'Acción'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((order) => {
                    const st = statusConfig[order.status] ?? statusConfig['en-revision'];
                    const total = calcTotal(order);
                    const isEditing = editingStatusFor === order.id;
                    const isUpdating = updatingStatus === order.id;
                    return (
                      <tr key={order.id} className="hover:bg-emerald-50/30 transition-colors group">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono text-sm font-semibold text-emerald-700">{order.order_number}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {new Date(order.entry_date).toLocaleDateString('es-CL')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm text-gray-900">{order.clients?.name || '—'}</div>
                          <div className="text-xs text-gray-400">{order.clients?.phone || ''}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm text-gray-900">{order.bikes?.brand || '—'}</div>
                          <div className="text-xs text-gray-400">{order.bikes?.model || order.bikes?.type || ''}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {order.mechanics?.name || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex flex-col gap-1 min-w-40">
                              <select
                                defaultValue={order.status}
                                disabled={isUpdating}
                                onChange={e => handleStatusChange(order.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                autoFocus
                                onBlur={() => setEditingStatusFor(null)}
                              >
                                {Object.entries(statusConfig).map(([key, cfg]) => (
                                  <option key={key} value={key}>{cfg.label}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingStatusFor(order.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all hover:opacity-80 cursor-pointer ${st.bg} ${st.color}`}
                              title="Click para cambiar estado"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {st.label}
                              <ChevronDown className="w-3 h-3 opacity-60" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          ${total.toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {onLoadOrder && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => { onLoadOrder(order); onClose(); }}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Total acumulado: <span className="font-semibold text-gray-900">${orders.reduce((s, o) => s + calcTotal(o), 0).toLocaleString('es-CL')} CLP</span>
          </p>
          <Button onClick={onClose} variant="outline" size="sm" className="border-gray-300">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

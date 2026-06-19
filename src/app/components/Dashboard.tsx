import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
  FileText, Clock, CheckCircle2, TrendingUp, AlertCircle, Wrench,
  Users, Bike, RefreshCw, ChevronRight, Calendar
} from 'lucide-react';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  readyOrders: number;
  deliveredToday: number;
  totalRevenue: number;
  totalClients: number;
  totalMechanics: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  entry_date: string;
  status: string;
  clients: { name: string } | null;
  bikes: { brand: string; type: string } | null;
  mechanics: { name: string } | null;
}

interface StatusCount {
  status: string;
  count: number;
}

const statusConfig: Record<string, { label: string; color: string; barColor: string }> = {
  'en-revision':         { label: 'En Revisión',        color: 'text-blue-600',    barColor: '#3b82f6' },
  'en-reparacion':       { label: 'En Reparación',       color: 'text-yellow-600',  barColor: '#f59e0b' },
  'esperando-repuestos': { label: 'Esp. Repuestos',      color: 'text-orange-600',  barColor: '#f97316' },
  'listo-retiro':        { label: 'Listo Retiro',        color: 'text-emerald-600', barColor: '#10b981' },
  'entregado':           { label: 'Entregado',           color: 'text-gray-600',    barColor: '#6b7280' },
  'cancelado':           { label: 'Cancelado',           color: 'text-red-500',     barColor: '#ef4444' },
};

interface DashboardProps {
  onNewOrder: () => void;
}

export function Dashboard({ onNewOrder }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all service orders for stats
      const { data: orders } = await supabase
        .from('service_orders')
        .select(`
          id, status, maintenance_price, entry_date,
          service_order_parts ( quantity, price )
        `);

      const { count: clientCount } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true });

      const { count: mechanicCount } = await supabase
        .from('mechanics')
        .select('id', { count: 'exact', head: true })
        .eq('active', true);

      // Fetch 5 most recent orders with joins
      const { data: recent } = await supabase
        .from('service_orders')
        .select(`
          id, order_number, entry_date, status,
          clients ( name ),
          bikes ( brand, type ),
          mechanics ( name )
        `)
        .order('entry_date', { ascending: false })
        .limit(6);

      const allOrders = orders || [];
      const today = new Date().toDateString();

      const calcTotal = (o: any) => {
        const m = o.maintenance_price ?? 0;
        const p = (o.service_order_parts || []).reduce((s: number, part: any) => s + part.quantity * part.price, 0);
        return m + p;
      };

      const statsData: DashboardStats = {
        totalOrders: allOrders.length,
        activeOrders: allOrders.filter(o => !['entregado', 'cancelado'].includes(o.status)).length,
        readyOrders: allOrders.filter(o => o.status === 'listo-retiro').length,
        deliveredToday: allOrders.filter(o => o.status === 'entregado' && new Date(o.entry_date).toDateString() === today).length,
        totalRevenue: allOrders.reduce((sum, o) => sum + calcTotal(o), 0),
        totalClients: clientCount ?? 0,
        totalMechanics: mechanicCount ?? 0,
      };

      // Status distribution for chart
      const counts: Record<string, number> = {};
      allOrders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
      const chartData = Object.entries(counts).map(([status, count]) => ({ status, count }));

      setStats(statsData);
      setRecentOrders((recent as unknown as RecentOrder[]) || []);
      setStatusCounts(chartData);
    } catch (error: any) {
      toast.error('Error al cargar el dashboard', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statusBadgeClasses: Record<string, string> = {
    'en-revision':         'bg-blue-100 text-blue-700 border-blue-200',
    'en-reparacion':       'bg-yellow-100 text-yellow-700 border-yellow-200',
    'esperando-repuestos': 'bg-orange-100 text-orange-700 border-orange-200',
    'listo-retiro':        'bg-emerald-100 text-emerald-700 border-emerald-200',
    'entregado':           'bg-gray-100 text-gray-600 border-gray-200',
    'cancelado':           'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Panel de Control</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={onNewOrder}>
            <FileText className="w-4 h-4 mr-2" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <RefreshCw className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-gray-400">Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Órdenes',
                value: stats?.totalOrders ?? 0,
                icon: FileText,
                gradient: 'from-blue-500 to-blue-600',
                sub: 'en el sistema',
              },
              {
                label: 'Órdenes Activas',
                value: stats?.activeOrders ?? 0,
                icon: Wrench,
                gradient: 'from-amber-500 to-orange-500',
                sub: 'en proceso',
              },
              {
                label: 'Listas para Retiro',
                value: stats?.readyOrders ?? 0,
                icon: CheckCircle2,
                gradient: 'from-emerald-500 to-teal-500',
                sub: 'pendientes',
              },
              {
                label: 'Ingresos Totales',
                value: `$${(stats?.totalRevenue ?? 0).toLocaleString('es-CL')}`,
                icon: TrendingUp,
                gradient: 'from-purple-500 to-indigo-600',
                sub: 'CLP acumulado',
              },
            ].map(card => (
              <div
                key={card.label}
                className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 text-white shadow-lg`}
              >
                <div className="flex items-start justify-between mb-3">
                  <card.icon className="w-6 h-6 text-white/80" />
                </div>
                <div className="text-3xl font-bold">{card.value}</div>
                <div className="text-sm font-medium mt-1 text-white/90">{card.label}</div>
                <div className="text-xs text-white/70 mt-0.5">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Clientes registrados', value: stats?.totalClients ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
              { label: 'Mecánicos activos', value: stats?.totalMechanics ?? 0, icon: UserIcon, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Entregados hoy', value: stats?.deliveredToday ?? 0, icon: CheckCircle2, color: 'text-purple-600 bg-purple-50' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Distribución por Estado
              </h3>
              {statusCounts.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-300">
                  <AlertCircle className="w-8 h-8" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statusCounts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="status"
                      tick={{ fontSize: 10 }}
                      tickFormatter={key => statusConfig[key]?.label.split(' ')[0] ?? key}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value: number) => [value, 'Órdenes']}
                      labelFormatter={(key: string) => statusConfig[key]?.label ?? key}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {statusCounts.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={statusConfig[entry.status]?.barColor ?? '#10b981'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                Últimas Órdenes
              </h3>
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-300">
                  <FileText className="w-8 h-8 mb-2" />
                  <p className="text-sm">Sin órdenes registradas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map(order => {
                    const badgeCls = statusBadgeClasses[order.status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
                    const stLabel = statusConfig[order.status]?.label ?? order.status;
                    return (
                      <div key={order.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Bike className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-emerald-700">{order.order_number}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded border ${badgeCls}`}>{stLabel}</span>
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {order.clients?.name} · {order.bikes?.brand} {order.bikes?.type}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.entry_date).toLocaleDateString('es-CL')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Small inline icon component to avoid import issues
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

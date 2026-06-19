-- Habilitar extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    contact_preference TEXT DEFAULT 'whatsapp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Bicicletas
CREATE TABLE IF NOT EXISTS public.bikes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT,
    type TEXT NOT NULL,
    color TEXT,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Mecánicos
CREATE TABLE IF NOT EXISTS public.mechanics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Órdenes de Servicio
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    bike_id UUID REFERENCES public.bikes(id) ON DELETE CASCADE,
    mechanic_id UUID REFERENCES public.mechanics(id) ON DELETE SET NULL,
    work_details TEXT NOT NULL,
    technical_comments TEXT,
    maintenance_price NUMERIC(10,2),
    status TEXT NOT NULL DEFAULT 'en-revision',
    notification_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Tipos de Mantención (Catálogo)
CREATE TABLE IF NOT EXISTS public.maintenance_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) -- opcional, por si tienen precio fijo
);

-- 6. Órdenes - Tipos de Mantención (N a N)
CREATE TABLE IF NOT EXISTS public.service_order_maintenances (
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE,
    maintenance_type_id UUID REFERENCES public.maintenance_types(id) ON DELETE CASCADE,
    PRIMARY KEY (service_order_id, maintenance_type_id)
);

-- 7. Tabla de Repuestos (Catálogo/Inventario)
CREATE TABLE IF NOT EXISTS public.parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    stock INT DEFAULT 0,
    default_price NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Repuestos por Orden de Servicio
CREATE TABLE IF NOT EXISTS public.service_order_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE,
    part_id UUID REFERENCES public.parts(id) ON DELETE SET NULL,
    name TEXT, -- En caso de que el repuesto no esté en catálogo y se ingrese a mano
    quantity INT NOT NULL DEFAULT 1,
    price NUMERIC(10,2) NOT NULL
);

-- Configuración de Seguridad para Supabase (RLS - Row Level Security)
-- Por ahora permitimos acceso total (publico) para el desarrollo
-- En producción deberías restringir esto a usuarios autenticados.
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for clients" ON public.clients FOR ALL USING (true);
CREATE POLICY "Allow all operations for bikes" ON public.bikes FOR ALL USING (true);
CREATE POLICY "Allow all operations for mechanics" ON public.mechanics FOR ALL USING (true);
CREATE POLICY "Allow all operations for service_orders" ON public.service_orders FOR ALL USING (true);
CREATE POLICY "Allow all operations for maintenance_types" ON public.maintenance_types FOR ALL USING (true);
CREATE POLICY "Allow all operations for service_order_maintenances" ON public.service_order_maintenances FOR ALL USING (true);
CREATE POLICY "Allow all operations for parts" ON public.parts FOR ALL USING (true);
CREATE POLICY "Allow all operations for service_order_parts" ON public.service_order_parts FOR ALL USING (true);

-- Tabla: business_hours
-- Guarda los horarios de atención por día de la semana para cada local.
-- day_of_week: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
CREATE TABLE public.business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    open_time TIME NOT NULL DEFAULT '09:00:00',
    close_time TIME NOT NULL DEFAULT '18:00:00',
    is_closed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, day_of_week)
);

ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON public.business_hours FOR SELECT USING (true);

CREATE POLICY "Enable insert for tenant owners"
ON public.business_hours FOR INSERT WITH CHECK (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
);

CREATE POLICY "Enable update for tenant owners"
ON public.business_hours FOR UPDATE USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
);

CREATE POLICY "Enable delete for tenant owners"
ON public.business_hours FOR DELETE USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
);


-- Tabla: appointments
-- Guarda los turnos/reservas realizados por los clientes.
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    services JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de servicios [{ id, name, price, duration_minutes }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Los clientes públicos pueden insertar turnos sin estar logueados (para el MVP).
-- Para proteger esto en el futuro, se podría requerir Auth o reCAPTCHA.
CREATE POLICY "Enable insert for anonymous users"
ON public.appointments FOR INSERT WITH CHECK (true);

-- Todos pueden ver los turnos (necesario para calcular los "huecos" libres en el calendario público).
-- ATENCIÓN: Solo deberíamos devolver start_time y end_time al público, pero por ahora RLS de SELECT está abierto.
CREATE POLICY "Enable read access for all users"
ON public.appointments FOR SELECT USING (true);

-- Solo el dueño del tenant puede actualizar o borrar turnos.
CREATE POLICY "Enable update for tenant owners"
ON public.appointments FOR UPDATE USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
);

CREATE POLICY "Enable delete for tenant owners"
ON public.appointments FOR DELETE USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
);

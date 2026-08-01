-- Actualización Fase 2: Personalización, Staff, Variantes y Estadísticas

-- 1. Modificar Tenants para personalización
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#8b5cf6'; -- purple-500
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS welcome_message TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- 2. Modificar Services para variantes
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- 3. Tabla Staff (Empleados/Peluqueros)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Enable all for tenant owners" ON public.staff FOR ALL USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
);

-- 4. Modificar Appointments para asignar Staff
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;

-- 5. Tabla Staff Schedules (Reemplaza a business_hours)
CREATE TABLE IF NOT EXISTS public.staff_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    is_working BOOLEAN NOT NULL DEFAULT true,
    -- Turno Mañana
    open_time TIME DEFAULT '09:00:00',
    close_time TIME DEFAULT '13:00:00',
    -- Turno Tarde (Puede ser null si no cortan a la siesta o solo trabajan medio día)
    open_time_2 TIME DEFAULT '16:00:00',
    close_time_2 TIME DEFAULT '20:00:00',
    UNIQUE(staff_id, day_of_week)
);

ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.staff_schedules FOR SELECT USING (true);
CREATE POLICY "Enable all for tenant owners" ON public.staff_schedules FOR ALL USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
);

-- 6. Tabla Blocked Slots (Bloqueos Manuales)
CREATE TABLE IF NOT EXISTS public.blocked_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.blocked_slots FOR SELECT USING (true);
CREATE POLICY "Enable all for tenant owners" ON public.blocked_slots FOR ALL USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
);

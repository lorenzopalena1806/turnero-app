-- Actualización Fase 3: Generalización Multi-Rubro

-- Agregamos columnas para personalizar cómo el dueño llama a su staff y servicios.
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS staff_label TEXT DEFAULT 'Profesional';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS service_label TEXT DEFAULT 'Servicio';

-- Security Fixes: Enable RLS and proper policies for all tables to prevent unauthorized access

-- 1. Enable RLS on all tables that might be missing it
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing overly permissive policies on appointments if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.appointments;

-- 3. Tenants table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tenants;
CREATE POLICY "Enable read access for all users" ON public.tenants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable update for tenant owners" ON public.tenants;
CREATE POLICY "Enable update for tenant owners" ON public.tenants FOR UPDATE USING (
    owner_id = auth.uid() OR id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid() AND role = 'ADMIN')
);

-- 4. Services table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.services;
CREATE POLICY "Enable read access for all users" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all for tenant owners" ON public.services;
CREATE POLICY "Enable all for tenant owners" ON public.services FOR ALL USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid() AND role = 'ADMIN')
);

-- 5. Appointments table policies (Fix for sensitive data exposure)
-- We only allow anonymous users to INSERT. They cannot SELECT.
-- The server uses the admin client (service role) to read appointments for availability checks.
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.appointments;
CREATE POLICY "Enable insert for anonymous users" ON public.appointments FOR INSERT WITH CHECK (true);

-- Only owners and admins can read appointments
CREATE POLICY "Enable read for tenant owners" ON public.appointments FOR SELECT USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
);

-- Update and Delete for owners and admins
DROP POLICY IF EXISTS "Enable update for tenant owners" ON public.appointments;
CREATE POLICY "Enable update for tenant owners" ON public.appointments FOR UPDATE USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid() AND role = 'ADMIN')
);

DROP POLICY IF EXISTS "Enable delete for tenant owners" ON public.appointments;
CREATE POLICY "Enable delete for tenant owners" ON public.appointments FOR DELETE USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid() AND role = 'ADMIN')
);

-- 6. Tenant Users table policies
DROP POLICY IF EXISTS "Enable read for tenant users" ON public.tenant_users;
CREATE POLICY "Enable read for tenant users" ON public.tenant_users FOR SELECT USING (
    user_id = auth.uid() OR
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid() AND role = 'ADMIN')
);

DROP POLICY IF EXISTS "Enable all for tenant owners" ON public.tenant_users;
CREATE POLICY "Enable all for tenant owners" ON public.tenant_users FOR ALL USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid() AND role = 'ADMIN')
);

-- 7. Staff Invites table policies
DROP POLICY IF EXISTS "Enable read for tenant owners" ON public.staff_invites;
CREATE POLICY "Enable read for tenant owners" ON public.staff_invites FOR SELECT USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid() AND role = 'ADMIN')
);

DROP POLICY IF EXISTS "Enable all for tenant owners" ON public.staff_invites;
CREATE POLICY "Enable all for tenant owners" ON public.staff_invites FOR ALL USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid() AND role = 'ADMIN')
);

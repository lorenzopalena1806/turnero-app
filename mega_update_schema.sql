-- Mega Update Schema Changes

-- 1. Tenants settings for features
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS require_payment_method BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS address_map_url TEXT;

-- 2. Appointments payment method
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- 3. Services images
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. RBAC (Role-Based Access Control) & Multi-Tenant Auth
-- Remove the old staff.user_id column if it exists since we are migrating to RBAC
ALTER TABLE public.staff DROP COLUMN IF EXISTS user_id;

-- Create the Junction Table for RBAC
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    role VARCHAR NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
    status VARCHAR NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    staff_profile_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    UNIQUE(user_id, tenant_id)
);

-- Migrate current owners to ADMINs in tenant_users
INSERT INTO public.tenant_users (user_id, tenant_id, role, status)
SELECT owner_id, id, 'ADMIN', 'ACTIVE'
FROM public.tenants
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Create staff_invites table
DROP TABLE IF EXISTS public.staff_invites; -- Drop if it exists from previous iteration
CREATE TABLE public.staff_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    used BOOLEAN NOT NULL DEFAULT false
);

-- Note: RLS policies will need to be updated to check `tenant_users` for access.

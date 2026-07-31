import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) redirect('/login?error=no_role')

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333]">
      
      {/* Header Fijo */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 py-4 bg-[#2563eb] text-white shadow-md">
        <div>
          <h1 className="text-xl font-bold m-0">{tenant.name}</h1>
          <p className="text-sm opacity-80 m-0">Panel de Control</p>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href={`/${tenant.slug}`} 
            target="_blank"
            className="text-sm font-medium hover:underline hidden sm:block"
          >
            Ver Tienda Pública
          </a>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-2 bg-transparent hover:bg-[#1e40af] transition-colors p-2 rounded text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto p-4 md:p-8">
        {children}
      </main>

    </div>
  )
}

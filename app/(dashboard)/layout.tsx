export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-purple-400">Tenant<span className="text-white">Dash</span></div>
          <div className="text-sm text-neutral-400">Panel de Propietario (Nodo 1)</div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>
    </div>
  )
}

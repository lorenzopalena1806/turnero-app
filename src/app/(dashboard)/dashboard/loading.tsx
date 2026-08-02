import { Settings } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="relative">
        <Settings className="w-16 h-16 text-indigo-300 animate-spin" />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full animate-pulse"></div>
      </div>
      <p className="text-indigo-900/50 font-black tracking-widest uppercase text-sm animate-pulse">
        Cargando datos...
      </p>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, Calendar, Users, BarChart3, Settings, History } from 'lucide-react'

export default function DashboardNav({ isStaff = false }: { isStaff?: boolean }) {
  const pathname = usePathname()

  let tabs = [
    { name: 'Catálogo', href: '/dashboard', icon: ClipboardList, exact: true },
    { name: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
    { name: 'Historial', href: '/dashboard/history', icon: History },
    { name: 'Equipo', href: '/dashboard/staff', icon: Users },
    { name: 'Estadísticas', href: '/dashboard/stats', icon: BarChart3 },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
  ]

  if (isStaff) {
    tabs = [
      { name: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
    ]
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-8 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => {
        const isActive = tab.exact 
          ? pathname === tab.href 
          : pathname?.startsWith(tab.href)
          
        return (
          <Link 
            key={tab.name}
            href={tab.href} 
            className={`flex items-center gap-2 py-4 border-b-[3px] text-sm whitespace-nowrap transition-colors ${
              isActive 
                ? 'border-purple-500 text-purple-600 font-black' 
                : 'border-transparent text-indigo-900/40 hover:text-indigo-900/70 font-bold'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </Link>
        )
      })}
    </div>
  )
}

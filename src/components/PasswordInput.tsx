'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function PasswordInput() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <input
        id="password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        required
        className="w-full bg-white/50 border-2 border-indigo-100 rounded-2xl px-5 py-3.5 pr-12 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm"
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-900/40 hover:text-indigo-900/70 transition-colors"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  )
}

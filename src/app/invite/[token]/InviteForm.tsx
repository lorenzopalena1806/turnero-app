'use client'

import { useState, useTransition } from 'react'
import { processInviteAction } from './actions'
import { useRouter } from 'next/navigation'

export default function InviteForm({ token }: { token: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const res = await processInviteAction(token, email, password)
      if (res.error) {
        setError(res.error)
      } else {
        router.push('/dashboard/agenda') // Or a dedicated staff dashboard
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-rose-50 text-rose-600 text-sm font-bold p-3 rounded-xl">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
        <input 
          type="email" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:border-purple-400 font-bold text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
        <input 
          type="password" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:border-purple-400 font-bold text-sm"
        />
      </div>

      <button 
        type="submit"
        disabled={isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-colors disabled:opacity-50 mt-2"
      >
        Crear Cuenta
      </button>
    </form>
  )
}

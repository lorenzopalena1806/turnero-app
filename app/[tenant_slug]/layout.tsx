import { CartProvider } from '@/components/CartProvider'

export default function TenantPublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-neutral-950 text-white relative">
        {/* Aesthetic background gradients */}
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
        
        <main className="relative z-10">
          {children}
        </main>
      </div>
    </CartProvider>
  )
}

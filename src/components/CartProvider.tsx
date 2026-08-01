'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  duration: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalPrice: number
  totalItems: number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  
  // Persistence could be added here using localStorage if needed, 
  // but transient in-memory state is fine for this flow.

  const addItem = (newItem: any) => {
    setItems((currentItems) => {
      const existing = currentItems.find(item => item.id === newItem.id)
      if (existing) {
        return currentItems.map(item => 
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      // Ensure quantity is set to 1 for new items, and duration is mapped correctly
      return [...currentItems, { 
        ...newItem, 
        quantity: 1,
        duration: newItem.duration_minutes || 30 // fallback if null
      }]
    })
    setIsOpen(true)
  }

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => setItems([])

  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

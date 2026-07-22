'use client'

import { useEffect } from 'react'

export function ClearCart() {
  useEffect(() => {
    localStorage.removeItem('cart-store')
  }, [])

  return null
}

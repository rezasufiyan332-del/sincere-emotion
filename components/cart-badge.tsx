import { useCartStore } from '@/lib/store/cart'

export function CartBadge() {
  const itemCount = useCartStore((state) => state.getItemCount())

  if (itemCount === 0) return null

  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f59e0b] text-[10px] font-bold text-[#0a0a0f]">
      {itemCount > 9 ? '9+' : itemCount}
    </span>
  )
}

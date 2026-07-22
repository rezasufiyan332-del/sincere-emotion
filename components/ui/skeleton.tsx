import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonVariants = cva(
  'rounded-md bg-muted',
  {
    variants: {
      variant: {
        text: 'h-4 w-full',
        circular: 'rounded-full',
        rectangular: 'h-32 w-full',
        card: 'h-48 w-full rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'text',
    },
  }
)

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        skeletonVariants({ variant, className }),
        'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent'
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants }
export type { SkeletonProps }

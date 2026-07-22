export interface Product {
  id: number
  name: string
  subtitle: string
  description: string
  benefits: string[]
  price: number
  originalPrice: number
  image: string
  bestseller: boolean
  featured?: boolean
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Anxious Attachment Guide',
    subtitle: 'Calm Your Anxiety, Reclaim Your Worth',
    description: 'Understanding the anxious attachment pattern and breaking the cycle of chasing unavailable partners.',
    benefits: [
      'Recognize anxious patterns early',
      'Calm your nervous system',
      'Stop self-abandonment',
      'Attract secure partners'
    ],
    price: 29,
    originalPrice: 49,
    image: '/product-1.png',
    bestseller: true
  },
  {
    id: 2,
    name: 'Avoidant Attachment Workbook',
    subtitle: 'Build Emotional Closeness',
    description: 'For those afraid of intimacy: Understanding avoidant patterns and learning to let people in.',
    benefits: [
      'Recognize avoidant triggers',
      'Build emotional safety',
      'Practice vulnerability',
      'Develop secure connections'
    ],
    price: 29,
    originalPrice: 49,
    image: '/product-2.png',
    bestseller: false
  },
  {
    id: 3,
    name: 'Secure Attachment Blueprint',
    subtitle: 'Your Foundation for Lasting Love',
    description: 'The ultimate guide to developing secure attachment and maintaining healthy relationships.',
    benefits: [
      'Develop secure attachment',
      'Create healthy boundaries',
      'Communicate with confidence',
      'Build lasting relationships'
    ],
    price: 39,
    originalPrice: 59,
    image: '/product-3.png',
    bestseller: false
  },
  {
    id: 4,
    name: 'Complete Healing Bundle',
    subtitle: 'All Three Guides + Bonus Workbook',
    description: 'The comprehensive solution: understand all attachment styles and create your healing journey.',
    benefits: [
      'All three complete guides',
      'Bonus practical workbook',
      'Email support',
      'Lifetime updates'
    ],
    price: 79,
    originalPrice: 147,
    image: '/product-4.png',
    bestseller: true,
    featured: true
  }
]

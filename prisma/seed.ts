import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: pool })

const products = [
  {
    name: 'Anxious Attachment Guide',
    slug: 'anxious-attachment-guide',
    subtitle: 'Calm Your Anxiety, Reclaim Your Worth',
    description: 'Understanding the anxious attachment pattern and breaking the cycle of chasing unavailable partners.',
    price: 2900,
    originalPrice: 4900,
    image: '/product-1.png',
    features: ['Recognize anxious patterns early', 'Calm your nervous system', 'Stop self-abandonment', 'Attract secure partners'],
    bestseller: true,
    featured: false,
  },
  {
    name: 'Avoidant Attachment Workbook',
    slug: 'avoidant-attachment-workbook',
    subtitle: 'Build Emotional Closeness',
    description: 'For those afraid of intimacy: Understanding avoidant patterns and learning to let people in.',
    price: 2900,
    originalPrice: 4900,
    image: '/product-2.png',
    features: ['Recognize avoidant triggers', 'Build emotional safety', 'Practice vulnerability', 'Develop secure connections'],
    bestseller: false,
    featured: false,
  },
  {
    name: 'Secure Attachment Blueprint',
    slug: 'secure-attachment-blueprint',
    subtitle: 'Your Foundation for Lasting Love',
    description: 'The ultimate guide to developing secure attachment and maintaining healthy relationships.',
    price: 3900,
    originalPrice: 5900,
    image: '/product-3.png',
    features: ['Develop secure attachment', 'Create healthy boundaries', 'Communicate with confidence', 'Build lasting relationships'],
    bestseller: false,
    featured: false,
  },
  {
    name: 'Complete Healing Bundle',
    slug: 'complete-healing-bundle',
    subtitle: 'All Three Guides + Bonus Workbook',
    description: 'The comprehensive solution: understand all attachment styles and create your healing journey.',
    price: 7900,
    originalPrice: 14700,
    image: '/product-4.png',
    features: ['All three complete guides', 'Bonus practical workbook', 'Email support', 'Lifetime updates'],
    bestseller: true,
    featured: true,
  },
]

async function main() {
  console.log('Seeding products...')

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    })
    console.log(`  Upserted: ${product.name}`)
  }

  const count = await prisma.product.count()
  console.log(`Total products: ${count}`)
  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

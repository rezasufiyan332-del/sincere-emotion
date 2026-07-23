import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: pool })

const products = [
  {
    title: 'Anxious Attachment Guide',
    slug: 'anxious-attachment-guide',
    subtitle: 'Calm Your Anxiety, Reclaim Your Worth',
    description: 'Understanding the anxious attachment pattern and breaking the cycle of chasing unavailable partners. A transformative 45-page guide with exercises, regulation tools, and a 21-day integration practice.',
    price: 200,           // ₹2
    originalPrice: 499,   // ~₹5
    coverImage: '/product-1.png',
    isFree: false,
    format: 'PDF' as const,
    pdfUrl: '/books/anxious-attachment-guide.md',
    pages: 45,
    category: 'attachment',
    tags: ['anxious', 'anxiety', 'guide', 'regulation'],
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'Avoidant Attachment Workbook',
    slug: 'avoidant-attachment-workbook',
    subtitle: 'Build Emotional Closeness',
    description: 'For those afraid of intimacy: Understanding avoidant patterns and learning to let people in. A practical 50-page workbook with vulnerability ladder, communication rewiring, and 30-day protocol.',
    price: 500,           // ₹5
    originalPrice: 999,   // ~₹10
    coverImage: '/product-2.png',
    isFree: false,
    format: 'PDF' as const,
    pdfUrl: '/books/avoidant-attachment-workbook.md',
    pages: 50,
    category: 'attachment',
    tags: ['avoidant', 'workbook', 'intimacy', 'vulnerability'],
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'Secure Attachment Blueprint',
    slug: 'secure-attachment-blueprint',
    subtitle: 'Your Foundation for Lasting Love',
    description: 'The ultimate guide to developing secure attachment and maintaining healthy relationships. Covers regulation mastery, SECURE communication, boundaries without walls, repair mastery, and 90-day integration plan.',
    price: 1000,          // ₹10
    originalPrice: 1999,  // ~₹20
    coverImage: '/product-3.png',
    isFree: false,
    format: 'PDF' as const,
    pdfUrl: '/books/secure-attachment-blueprint.md',
    pages: 50,
    category: 'attachment',
    tags: ['secure', 'blueprint', 'relationships', 'communication'],
    isActive: true,
    isFeatured: true,
  },
  {
    title: 'Free Mini Guide: Attachment Quick-Start',
    slug: 'free-mini-guide',
    subtitle: 'Discover Your Style in 3 Minutes',
    description: 'A transformative 15-page introduction to attachment theory. Quick quiz, immediate regulation tools, and clear next steps. Perfect starting point for your healing journey.',
    price: 0,             // FREE
    originalPrice: 0,
    coverImage: '/product-4.png',
    isFree: true,
    format: 'PDF' as const,
    pdfUrl: '/books/free-mini-guide.md',
    pages: 15,
    category: 'attachment',
    tags: ['free', 'intro', 'quiz', 'quick-start'],
    isActive: true,
    isFeatured: false,
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
    console.log(`  Upserted: ${product.title} (${product.isFree ? 'FREE' : '₹' + product.price/100})`)
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
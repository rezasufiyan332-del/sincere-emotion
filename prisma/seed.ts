import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: pool })

const products = [
  {
    title: 'Stop Chasing, Start Choosing',
    slug: 'stop-chasing-start-choosing',
    subtitle: 'A 7-Day Guide to Healing Your Attachment Wounds',
    description: 'The guide that helps you stop overthinking, stop chasing unavailable people, and finally feel secure in love. In just 7 days, you will understand why you keep attracting the wrong people, learn to calm your anxious thoughts in 10 minutes or less, and discover the 3-step method to break the anxious-avoidant cycle once and for all. This is for you if you are tired of giving your all to someone who gives you crumbs.',
    price: 900,            // $9.00
    originalPrice: 1500,   // $15.00
    coverImage: '/books/cover-stop-chasing.svg',
    isFree: false,
    format: 'PDF' as const,
    pdfUrl: '/books/stop-chasing-start-choosing.md',
    pages: 32,
    category: 'attachment',
    tags: ['anxious', 'healing', '7-day', 'quick-start'],
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'The Anxious Heart',
    slug: 'the-anxious-heart',
    subtitle: 'Your Complete Guide to Overcoming Relationship Anxiety',
    description: 'This is the book for anyone who has ever felt like they were too much, too needy, or too emotional. The Anxious Heart takes you through a journey of understanding where your anxiety comes from, why it shows up in relationships, and exactly how to rewire your nervous system so you no longer live in fear of abandonment. With 14 chapters of practical exercises, real stories, and step-by-step guidance, this book will change the way you love.',
    price: 2900,           // $29.00
    originalPrice: 4900,   // $49.00
    coverImage: '/books/cover-anxious-heart.svg',
    isFree: false,
    format: 'PDF' as const,
    pdfUrl: '/books/the-anxious-heart.md',
    pages: 68,
    category: 'attachment',
    tags: ['anxious', 'anxiety', 'relationships', 'comprehensive'],
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'Attachment Mastery',
    slug: 'attachment-mastery',
    subtitle: 'The Definitive Guide to Secure, Healthy Relationships',
    description: 'Attachment Mastery is the ultimate guide for anyone who is ready to transform their relationships from the inside out. Whether you are anxious, avoidant, or confused about why your relationships never seem to work, this book gives you the complete framework. You will learn to identify your exact attachment patterns, understand how they were formed in childhood, break free from toxic cycles, build secure communication skills, and create relationships that actually feel safe. This is not just a book; it is a complete system for lasting change.',
    price: 3900,           // $39.00
    originalPrice: 6700,   // $67.00
    coverImage: '/books/cover-mastery.svg',
    isFree: false,
    format: 'PDF' as const,
    pdfUrl: '/books/attachment-mastery.md',
    pages: 96,
    category: 'attachment',
    tags: ['secure', 'mastery', 'relationships', 'complete'],
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'The Complete Healing Collection',
    slug: 'the-complete-healing-collection',
    subtitle: 'All 3 Guides + Bonus Materials — Save 40%',
    description: 'Everything you need to heal your attachment wounds and build secure, lasting relationships. Includes Stop Chasing, Start Choosing (7-Day Guide), The Anxious Heart (Complete Guide), and Attachment Mastery (Definitive Guide), plus exclusive bonus materials including guided journal prompts, communication scripts, and a relationship audit worksheet. Over 196 pages of healing content. The complete journey from awareness to mastery.',
    price: 5900,           // $59.00
    originalPrice: 9900,   // $99.00
    coverImage: '/books/cover-bundle.svg',
    isFree: false,
    format: 'PDF' as const,
    pdfUrl: '/books/attachment-mastery.md',
    pages: 196,
    category: 'bundle',
    tags: ['bundle', 'complete', 'savings', 'all-in-one'],
    isActive: true,
    isFeatured: true,
  },
]

async function main() {
  console.log('Seeding products...')

  // Delete old test products that are no longer active
  const oldSlugs = ['anxious-attachment-guide', 'avoidant-attachment-workbook', 'secure-attachment-blueprint', 'free-mini-guide']
  const deleteResult = await prisma.product.deleteMany({
    where: { slug: { in: oldSlugs } },
  })
  console.log(`  Deleted ${deleteResult.count} old test products`)

  // Upsert new products
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    })
    console.log(`  Upserted: ${product.title} ($${product.price/100})`)
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
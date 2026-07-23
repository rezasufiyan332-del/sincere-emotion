import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: pool })

async function main() {
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 10 })
  console.log(JSON.stringify({ success: true, data: { products, meta: { page: 1, limit: 10, total: products.length, totalPages: 1 } } }, null, 2))
  await prisma.$disconnect()
}

main()
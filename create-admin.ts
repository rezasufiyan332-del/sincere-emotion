import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const pool = new PrismaPg({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: pool })

async function main() {
  const hashedPassword = bcrypt.hashSync('AdminPass123!', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('Admin created:', admin.id)
  await prisma.$disconnect()
}

main().catch(console.error)

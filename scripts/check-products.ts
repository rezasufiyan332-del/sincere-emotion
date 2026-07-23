import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany()
  products.forEach(p => console.log(p.title, p.price, p.isFree))
  await prisma.$disconnect()
}

main()
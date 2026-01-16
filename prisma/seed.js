import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 数据库种子文件')
  console.log('ℹ️  注意：此文件仅用于初始化数据库结构')
  console.log('✅ 数据库已准备就绪')
  console.log('📝 请通过注册页面创建您的第一个账户\n')
}

main()
  .catch((e) => {
    console.error('❌ 执行种子文件时出错:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


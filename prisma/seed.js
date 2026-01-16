import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始填充数据库...\n')

  // 清空现有数据（可选）
  console.log('🗑️  清空现有数据...')
  await prisma.link.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ 数据已清空\n')

  // 创建示例用户
  console.log('👥 创建示例用户...')
  
  // 加密密码
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: hashedPassword,
      name: 'Alice',
      emailVerified: true,
    }
  })
  console.log(`✅ 创建用户: ${user1.name} (${user1.email})`)

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: hashedPassword,
      name: 'Bob',
      emailVerified: true,
    }
  })
  console.log(`✅ 创建用户: ${user2.name} (${user2.email})`)

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      password: hashedPassword,
      name: 'Charlie',
      emailVerified: false,
    }
  })
  console.log(`✅ 创建用户: ${user3.name} (${user3.email})`)

  // 为 Alice 创建示例链接
  console.log('\n🔗 创建示例链接...')
  
  const aliceLinks = [
    {
      url: 'https://github.com',
      title: 'GitHub',
      description: '全球最大的代码托管平台',
      icon: 'https://github.githubassets.com/favicons/favicon.svg',
      category: '开发工具',
      isPublic: true,
      userId: user1.id,
    },
    {
      url: 'https://stackoverflow.com',
      title: 'Stack Overflow',
      description: '程序员问答社区',
      icon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico',
      category: '开发工具',
      isPublic: true,
      userId: user1.id,
    },
    {
      url: 'https://www.figma.com',
      title: 'Figma',
      description: '协作设计工具',
      icon: 'https://static.figma.com/app/icon/1/favicon.svg',
      category: '设计工具',
      isPublic: false,
      userId: user1.id,
    },
    {
      url: 'https://www.notion.so',
      title: 'Notion',
      description: '全能笔记和协作工具',
      icon: 'https://www.notion.so/images/favicon.ico',
      category: '生产力',
      isPublic: true,
      userId: user1.id,
    },
    {
      url: 'https://chat.openai.com',
      title: 'ChatGPT',
      description: 'AI 对话助手',
      icon: 'https://chat.openai.com/favicon.ico',
      category: 'AI工具',
      isPublic: false,
      userId: user1.id,
    },
  ]

  for (const linkData of aliceLinks) {
    await prisma.link.create({ data: linkData })
    console.log(`  ✅ ${linkData.title} (${linkData.category})`)
  }

  // 为 Bob 创建示例链接
  const bobLinks = [
    {
      url: 'https://www.youtube.com',
      title: 'YouTube',
      description: '视频分享平台',
      category: '娱乐',
      isPublic: true,
      userId: user2.id,
    },
    {
      url: 'https://www.netflix.com',
      title: 'Netflix',
      description: '在线流媒体服务',
      category: '娱乐',
      isPublic: false,
      userId: user2.id,
    },
    {
      url: 'https://www.twitter.com',
      title: 'Twitter',
      description: '社交媒体平台',
      category: '社交',
      isPublic: true,
      userId: user2.id,
    },
  ]

  for (const linkData of bobLinks) {
    await prisma.link.create({ data: linkData })
    console.log(`  ✅ ${linkData.title} (${linkData.category})`)
  }

  console.log('\n🎉 数据库填充完成！')
  console.log(`📊 共创建 ${3} 个用户`)
  console.log(`🔗 共创建 ${aliceLinks.length + bobLinks.length} 个链接`)
  console.log(`🔑 所有用户的默认密码: password123\n`)
}

main()
  .catch((e) => {
    console.error('❌ 填充数据库时出错:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


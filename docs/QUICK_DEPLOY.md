# Vercel 快速配置指南

## 🚀 5 分钟快速部署

### 步骤 1: 准备数据库

推荐使用 **PlanetScale**（免费）：

1. 访问 [planetscale.com](https://planetscale.com)
2. 创建免费账号
3. 创建新数据库
4. 获取连接字符串

或使用其他服务：
- **Railway**: [railway.app](https://railway.app)
- **Supabase**: [supabase.com](https://supabase.com)

### 步骤 2: 在 Vercel 导入项目

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 连接 GitHub 账号
3. 选择 LinkLantern 仓库
4. 点击 "Import"

### 步骤 3: 配置环境变量

在 Vercel 项目设置页面添加：

#### 必填变量

```
DATABASE_URL=你的数据库连接字符串
JWT_SECRET=随机生成的长字符串
JWT_REFRESH_SECRET=另一个随机生成的长字符串
```

#### 生成随机密钥

在终端运行：
```bash
# 生成 JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成 JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 4: 部署

1. 点击 "Deploy" 按钮
2. 等待构建完成（约 2-3 分钟）
3. 访问你的项目 URL

### 步骤 5: 初始化数据库

部署成功后，运行数据库迁移：

**方式 1: 使用 Vercel CLI**

```bash
# 安装 CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 拉取环境变量
vercel env pull .env.local

# 运行迁移
npx prisma migrate deploy
```

**方式 2: 在本地运行**

```bash
# 设置数据库连接
export DATABASE_URL="你的数据库URL"

# 运行迁移
npx prisma migrate deploy
```

## ✅ 验证部署

访问你的 Vercel URL，检查：

- [ ] 首页正常加载
- [ ] 可以注册新账号
- [ ] 可以登录
- [ ] 可以添加链接

## 🐛 遇到问题？

### 数据库连接失败

检查：
- DATABASE_URL 是否正确
- 数据库是否允许外部连接
- 是否添加了 Vercel IP 到数据库白名单

### 构建失败

检查：
- 环境变量是否都已设置
- 查看 Vercel 构建日志

### 运行时错误

查看：
- Vercel 函数日志（Functions → Logs）
- 是否运行了数据库迁移

## 📚 完整文档

详细配置请参考：[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## 💡 提示

- 首次部署后必须运行数据库迁移
- 修改环境变量后需要重新部署
- 使用自定义域名可以提升访问速度

---

部署成功！🎉 开始使用 LinkLantern 吧！


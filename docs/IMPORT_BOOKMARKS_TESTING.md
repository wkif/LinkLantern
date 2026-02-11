# 浏览器书签导入功能测试

## 测试目的

验证从浏览器导入书签功能的正确性和稳定性。

## 测试环境

- Node.js 版本: >= 18
- 数据库: MySQL
- 浏览器: Chrome/Firefox/Edge

## 测试步骤

### 1. 准备测试数据

使用项目提供的示例书签文件：
- 文件路径: `docs/example-bookmarks.html`
- 包含内容:
  - 6个顶级分类
  - 约30个书签链接
  - 包含嵌套文件夹
  - 部分包含图标数据

### 2. 测试追加模式

**步骤:**
1. 登录 LinkLantern 账户
2. 进入 管理后台 → 链接管理
3. 点击"从浏览器导入"按钮
4. 选择"追加模式"
5. 上传 `example-bookmarks.html`
6. 等待导入完成

**预期结果:**
- ✅ 成功解析所有书签
- ✅ 正确识别分类（文件夹名称）
- ✅ 嵌套文件夹使用最近父文件夹作为分类
- ✅ 保留现有链接
- ✅ 显示导入统计（导入数、跳过数、总数）

**验证点:**
- [ ] 导入成功提示
- [ ] 链接总数增加
- [ ] 分类列表更新
- [ ] 链接详情正确
- [ ] 图标显示正常

### 3. 测试去重功能

**步骤:**
1. 再次导入同一个书签文件
2. 使用追加模式
3. 观察结果

**预期结果:**
- ✅ 检测到重复链接
- ✅ 跳过所有重复项
- ✅ 不创建重复记录
- ✅ 显示跳过统计

**验证点:**
- [ ] 跳过数量 = 上次导入数量
- [ ] 链接总数不变
- [ ] 提示消息正确

### 4. 测试替换模式

**步骤:**
1. 备份当前数据（导出功能）
2. 使用替换模式导入书签
3. 确认警告提示
4. 完成导入

**预期结果:**
- ✅ 显示警告提示
- ✅ 删除所有现有链接
- ✅ 导入新书签
- ✅ 链接总数等于导入数量

**验证点:**
- [ ] 警告提示显示
- [ ] 旧链接被删除
- [ ] 新链接导入成功
- [ ] 数量统计正确

### 5. 测试错误处理

#### 5.1 上传非HTML文件

**步骤:**
- 上传 .txt 或 .json 文件

**预期结果:**
- ✅ 文件格式错误提示
- ✅ 不执行导入

#### 5.2 上传空文件

**步骤:**
- 上传空的HTML文件

**预期结果:**
- ✅ 提示未找到有效书签
- ✅ 导入统计全部为0

#### 5.3 上传格式错误的文件

**步骤:**
- 上传格式不正确的HTML

**预期结果:**
- ✅ 错误提示
- ✅ 部分解析成功的链接会导入

### 6. 测试性能

**测试数据量:**
- 小数据: ~50 个书签
- 中数据: ~500 个书签
- 大数据: ~1000+ 个书签

**性能指标:**
- 50 书签: < 10秒
- 500 书签: < 30秒
- 1000 书签: < 2分钟

**验证点:**
- [ ] 加载提示显示
- [ ] 进度反馈清晰
- [ ] 不卡顿或超时
- [ ] 最终统计正确

### 7. 测试数据完整性

**验证内容:**
1. URL 正确性
   - [ ] 完整的 URL
   - [ ] 协议正确 (http/https)
   - [ ] 特殊字符处理

2. 标题提取
   - [ ] 标题完整
   - [ ] HTML 标签被移除
   - [ ] 特殊字符正确显示

3. 分类映射
   - [ ] 文件夹名转为分类
   - [ ] 嵌套文件夹处理正确
   - [ ] 中文分类支持

4. 图标处理
   - [ ] Base64 图标保留
   - [ ] 过大图标替换为 favicon
   - [ ] 无图标自动获取

### 8. 测试用户体验

**交互测试:**
- [ ] 模态框显示正常
- [ ] 导入模式切换流畅
- [ ] 警告提示醒目
- [ ] 文件上传区域响应灵敏
- [ ] 加载状态明确
- [ ] 结果反馈详细

**响应式测试:**
- [ ] 移动端显示正常
- [ ] 平板端显示正常
- [ ] 桌面端显示正常

## 测试用例

### 用例1: 标准Chrome书签导入

**前置条件:**
- 已登录账户
- 有Chrome导出的标准书签文件

**操作步骤:**
1. 打开链接管理页面
2. 点击"从浏览器导入"
3. 选择追加模式
4. 上传Chrome书签文件
5. 等待完成

**预期结果:**
- 所有书签成功导入
- 分类正确映射
- 数据无丢失

### 用例2: Firefox书签导入

**前置条件:**
- 已登录账户
- 有Firefox导出的书签文件

**操作步骤:**
同上

**预期结果:**
- 成功识别Firefox格式
- 导入结果正确

### 用例3: 重复导入检测

**前置条件:**
- 已导入过一次书签

**操作步骤:**
1. 再次导入相同文件
2. 使用追加模式

**预期结果:**
- 检测到所有重复项
- 跳过重复链接
- 不创建重复记录

### 用例4: 大量书签导入

**前置条件:**
- 书签文件包含1000+链接

**操作步骤:**
1. 导入大文件
2. 观察性能

**预期结果:**
- 导入成功
- 性能可接受
- 无超时错误

## 自动化测试脚本

```typescript
// tests/import-bookmarks.spec.ts

import { test, expect } from '@playwright/test'

test.describe('浏览器书签导入功能', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // 进入链接管理页面
    await page.goto('/admin/links')
  })

  test('应该成功导入书签', async ({ page }) => {
    // 点击导入按钮
    await page.click('text=从浏览器导入')
    
    // 选择追加模式
    await page.click('text=追加模式')
    
    // 上传文件
    const fileInput = await page.locator('input[type="file"]')
    await fileInput.setInputFiles('./docs/example-bookmarks.html')
    
    // 等待导入完成
    await page.waitForSelector('text=导入完成', { timeout: 30000 })
    
    // 验证结果
    const successMessage = await page.locator('text=/成功导入.*个书签/')
    await expect(successMessage).toBeVisible()
  })

  test('应该检测重复链接', async ({ page }) => {
    // 导入两次
    for (let i = 0; i < 2; i++) {
      await page.click('text=从浏览器导入')
      await page.click('text=追加模式')
      const fileInput = await page.locator('input[type="file"]')
      await fileInput.setInputFiles('./docs/example-bookmarks.html')
      await page.waitForSelector('text=导入完成', { timeout: 30000 })
      await page.click('text=关闭')
    }
    
    // 第二次应该显示跳过信息
    const skipMessage = await page.locator('text=/跳过.*个重复项/')
    await expect(skipMessage).toBeVisible()
  })

  test('应该正确处理文件格式错误', async ({ page }) => {
    await page.click('text=从浏览器导入')
    
    // 上传非HTML文件
    const fileInput = await page.locator('input[type="file"]')
    await fileInput.setInputFiles('./package.json')
    
    // 应该显示错误提示
    await page.waitForSelector('text=/文件格式错误|格式不正确/')
  })
})
```

## Bug 报告模板

**Bug ID:** 
**标题:** 
**严重程度:** 🔴高 / 🟡中 / 🟢低
**复现步骤:**
1. 
2. 
3. 

**预期结果:**

**实际结果:**

**截图/日志:**

**环境信息:**
- 浏览器: 
- 操作系统: 
- 账户: 

## 测试检查清单

### 功能测试
- [ ] 追加模式导入
- [ ] 替换模式导入
- [ ] 重复检测
- [ ] 分类映射
- [ ] 图标处理
- [ ] 错误处理

### 兼容性测试
- [ ] Chrome 书签
- [ ] Firefox 书签
- [ ] Edge 书签
- [ ] Safari 书签

### 性能测试
- [ ] 小量数据（<100）
- [ ] 中量数据（100-500）
- [ ] 大量数据（>500）

### 安全测试
- [ ] 认证检查
- [ ] 输入验证
- [ ] XSS 防护
- [ ] SQL 注入防护

### 用户体验测试
- [ ] 提示信息清晰
- [ ] 加载状态明确
- [ ] 错误信息友好
- [ ] 操作流程顺畅

## 测试报告

**测试日期:** 
**测试人员:** 
**测试版本:** 

**测试结果统计:**
- 通过: __ / __
- 失败: __ / __
- 阻塞: __ / __
- 跳过: __ / __

**主要发现:**

**建议:**

**结论:** ✅ 通过 / ⚠️ 有问题 / ❌ 不通过

---

**备注:** 请在每次发布前完成所有测试项目

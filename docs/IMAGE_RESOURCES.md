# 背景图片资源推荐

## 🎨 推荐图片来源

为了方便用户获取高质量的背景图片，我们推荐使用 **UapiPro 随机图片 API**，它提供了丰富的图片资源库。

## 📋 API 信息

**接口地址**: `https://uapis.cn/api/v1/random/image`  
**文档地址**: https://uapis.cn/docs/api-reference/get-random-image  
**响应类型**: 302 重定向到图片（可直接用于 `<img>` 标签）

## 🏞️ 适合作为首页背景的图片类别

### 1. 风景图（landscape）⭐⭐⭐⭐⭐

**最推荐** - 自然风光，适合各种场景

```bash
# 获取风景图
https://uapis.cn/api/v1/random/image?category=landscape
```

**特点**：
- ✅ 颜色柔和，不会干扰前景内容
- ✅ 适合商务和个人使用
- ✅ 百搭风格

**示例场景**：
- 山川河流
- 日出日落
- 城市风光
- 自然景观

---

### 2. 电脑壁纸（pc_wallpaper）⭐⭐⭐⭐⭐

**最推荐** - 专为桌面设计，分辨率高

```bash
# 获取电脑壁纸
https://uapis.cn/api/v1/random/image?category=pc_wallpaper
```

**特点**：
- ✅ 高分辨率，适合大屏幕
- ✅ 构图专业
- ✅ 视觉效果好

---

### 3. AI 绘画（ai_drawing）⭐⭐⭐⭐

**现代艺术** - 独特的 AI 生成艺术风格

```bash
# 获取 AI 绘画
https://uapis.cn/api/v1/random/image?category=ai_drawing
```

**特点**：
- ✅ 独特的艺术风格
- ✅ 色彩丰富
- ✅ 充满创意

**适合用户**：
- 追求个性化
- 喜欢现代艺术
- 科技感爱好者

---

### 4. 二次元动漫（acg / general_anime）⭐⭐⭐

**动漫风格** - 适合动漫爱好者

```bash
# UapiPro 服务器动漫图（支持 pc/mb 子类别）
https://uapis.cn/api/v1/random/image?category=acg&type=pc

# 外部图床动漫图
https://uapis.cn/api/v1/random/image?category=general_anime

# 混合动漫（两者混合）
https://uapis.cn/api/v1/random/image?category=anime
```

**特点**：
- ✅ 色彩鲜艳
- ✅ 风格活泼
- ⚠️ 注意选择适合的图片

---

### 5. 手机壁纸（mobile_wallpaper）⭐⭐⭐

**竖版图片** - 适合移动端

```bash
# 获取手机壁纸
https://uapis.cn/api/v1/random/image?category=mobile_wallpaper
```

**注意**：
- ⚠️ 竖版图片不太适合电脑屏幕
- 适合移动端访问时使用

---

### 6. 福瑞（furry）⭐⭐

**特殊风格** - 小众爱好

```bash
# 福瑞图片（支持 z4k/szs8k/s4k/4k）
https://uapis.cn/api/v1/random/image?category=furry&type=4k
```

---

## 🎯 推荐使用指南

### 最佳组合推荐

根据不同用户群体，推荐以下组合：

#### 1. 商务专业风格
```
1. landscape（风景图）
2. pc_wallpaper（电脑壁纸）
```

#### 2. 艺术创意风格
```
1. ai_drawing（AI 绘画）
2. landscape（风景图）
```

#### 3. 动漫爱好者风格
```
1. anime（混合动漫）
2. general_anime（动漫图）
3. acg（二次元）
```

#### 4. 全随机风格
```
不指定 category 参数，从所有图片中随机获取
（不包含 ikun 和 ai_drawing）
https://uapis.cn/api/v1/random/image
```

---

## 💡 如何使用这些图片

### 方式一：直接下载

1. **在浏览器中打开 API 链接**
   ```
   https://uapis.cn/api/v1/random/image?category=landscape
   ```

2. **右键保存图片**
   - 右键点击图片
   - 选择"图片另存为..."
   - 保存到本地

3. **压缩图片**（重要！）
   - 使用 [TinyPNG](https://tinypng.com/) 压缩到 4MB 以下
   - 或使用 [Squoosh](https://squoosh.app/) 调整质量

4. **上传到 LinkLantern**
   - 登录账户
   - 进入管理后台 → 关于
   - 上传压缩后的图片

### 方式二：批量获取（开发者）

如果您想要批量获取多张图片供用户选择：

```javascript
// 获取随机风景图
async function getRandomImage(category = 'landscape') {
  const url = `https://uapis.cn/api/v1/random/image?category=${category}`;
  
  try {
    // 使用 fetch 获取图片
    const response = await fetch(url);
    
    // 获取重定向后的最终 URL
    const imageUrl = response.url;
    
    // 或者直接获取图片 Blob
    const blob = await response.blob();
    
    return { imageUrl, blob };
  } catch (error) {
    console.error('获取图片失败:', error);
  }
}

// 使用示例
const { imageUrl, blob } = await getRandomImage('landscape');
```

---

## 📊 不同类别的特点对比

| 类别 | 适合场景 | 分辨率 | 文件大小 | 推荐度 |
|------|---------|--------|---------|--------|
| **landscape** | 通用背景 | 高 | 中等 | ⭐⭐⭐⭐⭐ |
| **pc_wallpaper** | 桌面背景 | 很高 | 较大 | ⭐⭐⭐⭐⭐ |
| **ai_drawing** | 艺术风格 | 高 | 中等 | ⭐⭐⭐⭐ |
| **general_anime** | 动漫爱好者 | 高 | 中等 | ⭐⭐⭐ |
| **acg** | 二次元 | 中-高 | 中等 | ⭐⭐⭐ |
| **mobile_wallpaper** | 移动端 | 中 | 较小 | ⭐⭐⭐ |
| **furry** | 特殊爱好 | 高 | 较大 | ⭐⭐ |

---

## ⚠️ 使用注意事项

### 1. 文件大小限制

- **数据库限制**：4MB（原始文件）
- **编码后大小**：约 5.3MB（base64）
- **解决方案**：
  - ✅ 使用图片压缩工具
  - ✅ 降低图片质量到 80-85%
  - ✅ 缩小图片尺寸

### 2. 图片质量

- **高分辨率图片**（如 pc_wallpaper）可能超过 4MB
- **建议操作**：
  1. 下载图片后查看文件大小
  2. 如果超过 4MB，使用压缩工具
  3. 建议压缩到 1-2MB，效果最佳

### 3. 随机性

- 每次访问 API 都会返回不同的图片
- 如果喜欢某张图片，记得保存下来
- 可以多次刷新获取满意的图片

### 4. 版权说明

- 请遵守图片提供方的使用条款
- 个人使用通常没有问题
- 商业用途请谨慎

---

## 🛠️ 实用工具链接

### 图片压缩工具

1. **[TinyPNG](https://tinypng.com/)**
   - 支持：PNG、JPG
   - 压缩率：通常 70%+
   - 特点：简单易用，效果好

2. **[Squoosh](https://squoosh.app/)**
   - 支持：多种格式
   - 特点：Google 出品，功能强大

3. **[Compressor.io](https://compressor.io/)**
   - 支持：多种格式
   - 特点：可调节压缩级别

### 图片处理工具

- **[remove.bg](https://www.remove.bg/)** - 移除背景
- **[Photopea](https://www.photopea.com/)** - 在线 PS
- **[Canva](https://www.canva.com/)** - 图片编辑

---

## 🎨 推荐工作流

### 获取并使用背景图片的完整流程

```
1. 选择分类
   ↓
2. 访问 API 获取图片
   https://uapis.cn/api/v1/random/image?category=landscape
   ↓
3. 保存图片到本地
   ↓
4. 检查文件大小
   如果 > 4MB：
   ↓
5. 使用 TinyPNG 压缩
   目标：1-2MB
   ↓
6. 上传到 LinkLantern
   管理后台 → 关于 → 首页背景设置
   ↓
7. 预览效果
   ↓
8. 返回首页查看
   ✅ 完成！
```

---

## 📝 快速链接

### 风景类（推荐）
```
https://uapis.cn/api/v1/random/image?category=landscape
```

### 电脑壁纸（推荐）
```
https://uapis.cn/api/v1/random/image?category=pc_wallpaper
```

### AI 绘画（艺术风格）
```
https://uapis.cn/api/v1/random/image?category=ai_drawing
```

### 混合动漫（动漫爱好者）
```
https://uapis.cn/api/v1/random/image?category=anime
```

### 全随机（惊喜）
```
https://uapis.cn/api/v1/random/image
```

---

## 💡 额外建议

1. **试试多个类别**
   - 不同类别有不同风格
   - 多刷新几次找到喜欢的

2. **季节性背景**
   - 春天：风景图（landscape）
   - 夏天：自然风光
   - 秋天：暖色调风景
   - 冬天：冷色调风景

3. **主题一致性**
   - 如果网站有特定主题，选择匹配的背景
   - 考虑品牌色彩

4. **测试效果**
   - 上传后在明暗两种模式下测试
   - 确保内容清晰可读

---

**更新时间**: 2026-01-19  
**API 提供方**: UapiPro (https://uapis.cn/)  
**推荐指数**: ⭐⭐⭐⭐⭐


# MOD & 工具页面 设计方案

**日期:** 2026-06-06
**目标:** 为 GameVault 新增 MOD 页面和升级工具页面，建立完整的前台展示+后台管理体系

## 架构

```
前台                         后台
/mods          MOD展示页     /admin/mods       MOD管理（列表+增删改）
/mods/[id]     MOD详情页     /admin/mods/add   MOD添加表单
/tools         工具展示页     /admin/tools      工具管理（列表+增删改）
/tools/[id]    工具详情页     /admin/tools/add  工具添加表单

数据:
data/mods.json      MOD数据
data/tools.json     工具数据（已有，需升级字段结构）

API:
/api/mods           GET/POST/PUT/DELETE
/api/tools          GET/POST/PUT/DELETE（已有GET，需扩展）
/api/github-stars   GET ?url= 代理获取GitHub star数
```

## 数据模型

### MOD

```typescript
interface Mod {
  id: number
  title: string              // 名称
  description: string        // 描述
  coverImage: string         // 封面图
  category: '模组' | '存档'  // 分类
  gameName: string           // 所属游戏
  author: string             // 作者
  version: string            // 版本号
  fileSize: string           // 文件大小
  downloadLinks: {
    platform: string         // 网盘名称（百度网盘/夸克/123云盘等）
    url: string
    password: string
  }[]
  tags: string[]             // 标签
  installInstructions: string // 安装说明
  downloadCount: number      // 下载量
  createdAt: string          // 创建时间 ISO
  updatedAt: string          // 更新时间 ISO
}
```

### 工具（升级现有 tools.json）

```typescript
interface Tool {
  id: number
  name: string               // 名称
  description: string        // 描述
  coverImage: string         // 封面图/logo
  category: string           // 分类（游戏引擎/游戏框架/模拟器/游戏工具）
  language: string           // 编程语言
  githubUrl: string          // GitHub 仓库地址
  stars: number              // GitHub star数（自动获取）
  downloadLinks: {           // 新增：下载链接
    platform: string
    url: string
    password: string
  }[]
  tags: string[]             // 标签
  author: string             // 作者
  version: string            // 版本号
  fileSize: string           // 文件大小
  downloadCount: number      // 下载量
  createdAt: string
  updatedAt: string
}
```

## 前台页面

### /mods — MOD 列表页

- **筛选栏**: 分类（全部/模组/存档）、所属游戏下拉（从 mods.json 聚合）、搜索框
- **排序**: 最新上架 / 最热门 / 按名称
- **卡片网格**: 复用 GameCard 风格，2-5列响应式
  - 封面图 + 分类角标（模组=绿/存档=蓝）
  - 标题、所属游戏、作者、版本号、下载量
- **分页**: 和 /games 相同逻辑（page/pageSize/ellipsis）
- **空状态**: 无结果时显示提示

### /mods/[id] — MOD 详情页

- 大封面图、标题、作者、版本、文件大小
- 分类标签 + 游戏名标签 + 自定义 tags
- 描述段落
- 安装说明段落（独立区块，灰色背景）
- 下载链接列表（仅登录可见，未登录显示"登录后查看下载"）
- 下载走 /api/download?type=mod&id=&index= 记录计数

### /tools — 工具列表页（升级）

- **筛选栏**: 分类（全部/游戏引擎/游戏框架/模拟器/游戏工具）、语言筛选
- **排序**: 最新 / star最多 / 按名称
- **卡片网格**: 复用风格
  - 封面图/logo、名称、描述
  - 语言角标（保留现有颜色方案）、GitHub star数
  - 分类标签 + 自定义 tags
- **分页**: 同上
- 点击卡片跳转详情页

### /tools/[id] — 工具详情页（新增）

- 和 MOD 详情页结构一致
- 额外显示 GitHub 链接（外链图标）
- 下载链接列表

## 后台管理

### /admin/mods — MOD 管理

- 表格: 封面缩略图 | 名称 | 分类 | 所属游戏 | 版本 | 下载量 | 操作(编辑/删除)
- 搜索/筛选

### /admin/mods/add — 添加 MOD

- 表单字段: 名称、描述(textarea)、封面图(URL输入)、分类(下拉: 模组/存档)、所属游戏(input+datalist自动补全)、作者、版本号、文件大小、标签(逗号分隔)、安装说明(textarea)、下载链接(动态增减行: 平台名+URL+密码)

### /admin/tools — 工具管理

- 表格: logo缩略图 | 名称 | 分类 | 语言 | Star | 下载量 | 操作

### /admin/tools/add — 添加工具

- 表单字段: 名称、描述、封面图、GitHub URL（输入后自动拉取star数+语言）、分类、标签、下载链接(动态增减行)
- GitHub信息获取: 输入GitHub URL → 点"获取信息"按钮 → 调 /api/github-stars → 自动填入语言、star数

## API 路由

| 端点 | 方法 | 认证 | 说明 |
|---|---|---|---|
| `/api/mods` | GET | 无 | 返回 `{ mods, categories, games }` |
| `/api/mods` | POST | Admin | 添加MOD |
| `/api/mods` | PUT | Admin | 更新MOD `{ id, ...updates }` |
| `/api/mods` | DELETE | Admin | `?id=` 删除MOD |
| `/api/tools` | GET/POST/PUT/DELETE | 同上 | 工具CRUD（GET无认证） |
| `/api/github-stars` | GET | Admin | `?url=` 返回 `{ stars, language }` |
| `/api/download` | GET | 无 | 扩展 `?type=mod&id=&index=` |

## 数据升级

现有 tools.json 需迁移:
- `url` → `githubUrl`
- `stars` 从字符串 `"95k+"` → 数字（通过 GitHub API 重新获取）
- 新增字段: coverImage、downloadLinks、author、version、fileSize、downloadCount、createdAt、updatedAt
- 保留现有12条数据，字段不齐的给默认值

## 技术要点

- GitHub star 获取: `/api/github-stars` 用 `fetch` 调 GitHub API `https://api.github.com/repos/{owner}/{repo}`，带 User-Agent 头，8s 超时。返回 `{ stars, language }`
- 工具列表 GET 时 star 数返回已有数据（不实时查 API，避免 429 限流），后台点"获取信息"才实时查
- 下载计数: 扩展 `/api/download` 加 `type` 参数区分 game/mod/tool
- 所有数据同步读写（readFileSync/writeFileSync），和游戏一致

## Admin Dashboard 更新

后台首页统计卡片新增:
- "MOD 总数" + "工具总数"
- 快捷操作加 "添加 MOD" 和 "添加工具"

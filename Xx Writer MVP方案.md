# Xx Writer MVP 方案

> 目标：做一款面向外部客户开放使用的原创长文小说 AI 创作桌面软件。
>
> 原则：第一版只服务长文小说创作，不做文章、自媒体、短文案或平台发布。

## 1. 产品定位

`Xx Writer` 是一个面向长文小说作者的 AI 小说工作台。

它把长篇小说创作中最容易散掉的内容放到一个地方：

- 分卷
- 章节
- 大纲
- 人物
- 世界观
- 伏笔
- 时间线
- 备忘
- AI 续写和润色

第一版的核心任务：

```text
让作者能稳定写长篇，而不是只生成一段好看的文字。
```

## 2. 第一版核心体验

打开软件后，用户直接进入小说工作台：

```text
┌─────────────────────────────────────────────────────────────┐
│ 顶栏：作品 / 新建章节 / 导入 / 导出 / 模型状态 / 设置          │
├──────────────┬──────────────────────────────┬───────────────┤
│ 左栏          │ 中间编辑器                    │ 右栏 AI 助手   │
│              │                              │               │
│ 作品目录      │ 章节标题                      │ 当前上下文      │
│ 分卷/章节     │ 正文编辑区                    │ 小说模板        │
│ 大纲          │ 字数 / 保存状态               │ 对话区          │
│ 人物          │                              │ 输入框          │
│ 世界观        │                              │               │
│ 伏笔          │                              │               │
│ 时间线        │                              │               │
└──────────────┴──────────────────────────────┴───────────────┘
```

用户最常用路径：

1. 新建小说项目。
2. 填写题材、简介、主角和核心卖点。
3. 创建分卷和章节。
4. 写正文或导入已有章节。
5. 补充人物、世界观、伏笔、时间线。
6. 选择“续写下一段”“润色本章”“生成章纲”“检查伏笔”等小说模板。
7. AI 读取当前章节、最近章节摘要、人物状态和设定，输出结果。
8. 用户插入、替换、复制或另存为新版本。

## 3. MVP 功能清单

### 3.1 小说项目管理

第一版要做：

- 新建小说项目
- 打开小说项目
- 最近项目列表
- 删除项目
- 项目基础信息：书名、题材、简介、主角、创建时间、更新时间
- 项目字数统计

暂不做：

- 文章项目
- 团队协作
- 云端账号
- 会员系统

### 3.2 分卷与章节

第一版要做：

- 左侧分卷/章节树
- 新建分卷
- 新建章节
- 重命名
- 删除
- 上移/下移排序
- 章节字数统计
- 章节状态：草稿、待润色、已完成

默认结构：

```text
作品名/
├─ volumes/
│  └─ 第一卷/
│     ├─ 001.md
│     └─ 002.md
├─ outline/
├─ characters/
├─ world/
├─ foreshadowing/
├─ timeline/
├─ notes/
└─ exports/
```

### 3.3 小说资料库

第一版要做：

- 总纲
- 分卷大纲
- 人物卡
- 世界观卡
- 伏笔卡
- 时间线条目
- 备忘录

人物卡字段：

- 姓名
- 身份
- 目标
- 性格
- 关系
- 当前状态
- 禁忌/不能写崩的点

伏笔卡字段：

- 伏笔名称
- 埋设章节
- 回收章节
- 当前状态：未回收、进行中、已回收
- 说明

时间线字段：

- 时间点
- 事件
- 涉及人物
- 关联章节
- 备注

### 3.4 编辑器

第一版要做：

- Markdown/纯文本编辑
- 自动保存
- 字数统计
- 当前章节保存状态
- 选中文本后可发送给 AI
- 撤销/重做
- 查找

暂不做：

- 复杂富文本
- 多人协作
- 所见即所得排版

编辑器推荐：

```text
CodeMirror 6
```

### 3.5 AI 侧栏

第一版要做：

- 模型配置：Base URL、API Key、Model
- 支持 OpenAI-compatible 接口
- 会话列表
- 新建会话
- 清空上下文
- 发送当前章节
- 发送选中文本
- 选择上下文包
- 输出后支持：复制、插入到光标、替换选区、保存为新版本

上下文包第一版包含：

- 当前章节
- 最近 3 章摘要
- 总纲
- 当前分卷大纲
- 主要人物卡
- 世界观卡
- 未回收伏笔
- 相关时间线

### 3.6 小说模板库

模板来源：

- 内置官方小说模板
- 用户自建模板
- 用户从本地导入模板包
- 后续支持在线模板市场

第一版内置模板：

- 续写下一段
- 续写下一章
- 当前章节润色
- 降低 AI 味
- 生成章纲
- 生成分卷大纲
- 生成人物卡
- 生成世界观设定
- 提炼本章摘要
- 提炼前情摘要
- 检查人物一致性
- 检查伏笔是否遗忘
- 检查时间线冲突

模板格式建议：

```yaml
---
name: 续写下一段
category: novel_continue
description: 基于当前章节、最近章节摘要、人物状态和设定续写下一段
inputs:
  - current_chapter
  - recent_summaries
  - character_cards
  - world_cards
  - foreshadowing_cards
---

你是一名长篇小说续写助手...
```

第一版可以先不做复杂表单，只做上下文拼装：

```text
系统提示词 = 选中的小说模板
用户输入 = 当前章节/选中文本 + 用户补充要求
项目上下文 = 用户勾选的上下文包
```

### 3.7 导入导出

第一版要做：

- 导入 `.txt`
- 导入 `.md`
- 导出单章 `.txt`
- 导出单章 `.md`
- 导出全书 `.txt`
- 导出全书 `.md`
- 导出项目 `.zip`

第二阶段再做：

- DOCX 导入
- DOCX 导出
- ePub 导出
- WebDAV 同步

## 4. 数据目录结构

默认项目目录：

```text
Documents\XxWriterNovels
```

单个项目结构：

```text
MyNovel/
├─ .xxwriter/
│  ├─ project.json
│  ├─ index.sqlite
│  ├─ sessions/
│  ├─ summaries/
│  └─ snapshots/
├─ volumes/
│  └─ 第一卷/
│     ├─ 001.md
│     └─ 002.md
├─ outline/
│  ├─ main.md
│  └─ volume-001.md
├─ characters/
│  └─ 主角.md
├─ world/
├─ foreshadowing/
├─ timeline/
├─ notes/
└─ exports/
```

`project.json` 示例：

```json
{
  "name": "MyNovel",
  "type": "novel",
  "genre": "玄幻",
  "premise": "一句话故事核心",
  "createdAt": "2026-06-03T00:00:00+08:00",
  "updatedAt": "2026-06-03T00:00:00+08:00",
  "version": 1
}
```

## 5. 技术栈

推荐技术栈：

```text
Tauri + React + TypeScript + CodeMirror 6 + SQLite
```

关键库建议：

- 桌面壳：Tauri
- 前端：React
- 样式：Tailwind CSS 或 CSS Modules
- 编辑器：CodeMirror 6
- 本地数据库：SQLite
- 文件系统：Tauri fs plugin
- 压缩导出：zip 库
- AI 请求：fetch + OpenAI-compatible adapter

## 6. 核心数据模型

### NovelProject

```ts
type NovelProject = {
  id: string;
  name: string;
  genre: string;
  premise: string;
  rootPath: string;
  createdAt: string;
  updatedAt: string;
};
```

### Chapter

```ts
type Chapter = {
  id: string;
  projectId: string;
  volumeId: string;
  title: string;
  path: string;
  order: number;
  status: "draft" | "polishing" | "done";
  wordCount: number;
  summary?: string;
  updatedAt: string;
};
```

### CharacterCard

```ts
type CharacterCard = {
  id: string;
  projectId: string;
  name: string;
  role: string;
  goal: string;
  personality: string;
  relationships: string;
  currentState: string;
  constraints: string;
};
```

### ForeshadowingCard

```ts
type ForeshadowingCard = {
  id: string;
  projectId: string;
  title: string;
  plantedInChapterId?: string;
  resolvedInChapterId?: string;
  status: "open" | "in_progress" | "resolved";
  note: string;
};
```

### NovelTemplate

```ts
type NovelTemplate = {
  id: string;
  name: string;
  category: "continue" | "polish" | "outline" | "character" | "world" | "summary" | "check" | "custom";
  sourcePath?: string;
  content: string;
  enabled: boolean;
};
```

## 7. 页面设计

### 7.1 首页

首页是小说项目入口：

- 最近作品
- 新建小说
- 打开本地小说项目
- 模型连接状态
- 模板库状态

### 7.2 小说工作台

左栏：

- 作品目录
- 分卷/章节树
- 大纲
- 人物
- 世界观
- 伏笔
- 时间线
- 备忘

中间：

- 章节标题
- 编辑器
- 字数统计
- 保存状态

右栏：

- AI 会话
- 小说模板选择
- 上下文包开关
- 输出操作按钮

### 7.3 设置

设置第一版只保留必要项：

- API Key
- Base URL
- Model
- 默认小说项目目录
- 模板导入/导出
- 自动保存间隔
- 主题：浅色/深色/跟随系统

## 8. 7 天开发拆分

### 第 1 天：项目骨架

- 初始化 Tauri + React + TypeScript
- 建立三栏小说工作台布局
- 创建首页和工作台空壳

### 第 2 天：小说项目与章节树

- 新建小说项目
- 打开小说项目
- 创建默认目录结构
- 分卷/章节树
- 新建/删除/重命名章节

### 第 3 天：编辑器

- 接入 CodeMirror 6
- 打开章节
- 自动保存
- 字数统计
- 选区读取
- 查找

### 第 4 天：资料库

- 大纲页面
- 人物卡
- 世界观卡
- 伏笔卡
- 时间线基础列表

### 第 5 天：AI 配置与聊天

- 设置 API Key/Base URL/Model
- OpenAI-compatible 请求
- 右侧聊天面板
- 会话保存
- 输出复制/插入/替换

### 第 6 天：小说模板与上下文包

- 内置小说模板
- 用户模板创建/编辑
- 上下文包勾选
- 当前章节 + 设定资料 + 模板组合发送
- 续写和润色基础流程

### 第 7 天：导出与打磨

- 单章 Markdown/TXT 导出
- 全书 Markdown/TXT 导出
- 项目 zip 备份
- 错误提示
- 空状态
- 首轮可用性测试

## 9. 第一版验收标准

第一版完成时，至少要能做到：

- 能创建小说项目。
- 能创建分卷和章节。
- 能在章节里写 Markdown/纯文本。
- 能自动保存。
- 能维护大纲、人物、世界观、伏笔和时间线。
- 能配置 AI 模型。
- 能选择小说模板调用 AI。
- 能选择上下文包。
- 能把 AI 结果插入、替换或复制。
- 能导出单章和全书 Markdown/TXT。

## 10. 暂缓功能

为了第一版真正做出来，以下功能先不做：

- 文章写作
- 自媒体改写
- 公众号排版
- 平台发布
- 会员系统
- 在线模板市场
- WebDAV
- DOCX
- PDF
- ePub
- 多人协作
- 复杂富文本排版

## 11. 下一步

第三项直接进入工程实现：

```text
创建 Xx Writer 小说版项目骨架
```

执行内容：

- 新建工程目录
- 初始化 Tauri + React + TypeScript
- 搭建三栏小说工作台 UI
- 做本地小说项目读写的第一条闭环


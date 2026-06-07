# OpenWrite 功能拆解

> 拆解对象：`E:\OpenWrite\OpenWrite-v1.2.0-windows-x64`
>
> 拆解时间：2026-06-03
>
> 依据：本地安装包目录、`OpenWrite.exe` 元数据、Flutter AOT 包 `data\app.so` 中可见模块名与字符串。
>
> 边界说明：本文只做产品功能和架构层面的分析，不复制 OpenWrite 的代码、图标、文案、品牌或资源。

## 1. 基本判断

OpenWrite 是一个 Windows 桌面端写作软件，使用 Flutter 打包。

本地可确认信息：

- 产品名：`OpenWrite`
- 版本：`1.2.0+2012`
- 包标识：`com.openwrite`
- 技术形态：Flutter Windows 桌面应用
- 应用体积：约 34 MB
- 核心业务代码位置：`data\app.so`

从模块命名和字符串判断，它不是单纯的 Markdown 编辑器，而是一个面向长文/小说创作的 AI 写作工作台。

## 2. 可见模块结构

### 2.1 页面与弹窗

本地包中可见的页面/弹窗模块包括：

- `win_home_screen`
- `win_directory_panel`
- `win_novel_panel`
- `win_chat_panel`
- `win_settings_dialog`
- `skill_marketplace_dialog`
- `webdav_sync_dialog`
- `save_to_file_dialog`
- `memo_dialog`
- `distill_dialog`
- `name_generator_dialog`
- `novel_crawler_dialog`
- `card_draw_dialog`

由此可以推断主界面大概率是三栏或多面板工作台：

- 首页/入口区
- 左侧目录或项目树
- 中间小说/正文编辑区
- 右侧 AI 聊天或辅助面板
- 弹窗承载设置、导出、同步、技能市场、备忘录、起名、爬虫等任务

### 2.2 服务层

本地包中可见的服务模块包括：

- `chat_engine`
- `llm_client`
- `model_discovery`
- `session_manager`
- `skill_manager`
- `skill_marketplace_service`
- `storage_service`
- `platform_storage`
- `import_export_service`
- `docx_import_service`
- `word_export_service`
- `webdav_service`
- `memo_service`
- `novel_tools`
- `novel_crawler_service`
- `anysearch_service`
- `announcement_service`
- `feedback_service`
- `heartbeat_service`
- `update_service`
- `usage_limit_service`
- `vip_service`

这说明它的核心不是一个单一编辑器，而是围绕“写作项目 + AI 会话 + 技能/工具 + 同步导入导出”的完整应用。

## 3. 功能模块拆解

### 3.1 写作项目

可见关键词：

- `create_project`
- `CreateProject`
- `DeleteProject`
- `createNovelProject`
- `current_novel_project`
- `novel_project`
- `novel_projects`
- `project_id`
- `project files`

推断功能：

- 创建小说/写作项目
- 删除项目
- 切换当前项目
- 项目内文件或章节管理
- 项目打包备份

同类产品设计建议：

- 项目作为一级实体
- 每个项目包含章节、资料、人物、设定、备忘录、AI 会话、导出配置
- 项目目录和文件树保持本地可读，避免用户数据被锁死在私有数据库里

### 3.2 目录与章节管理

可见关键词：

- `win_directory_panel`
- `chapter_sort`
- `delete_lines`
- `new_text`
- `oldText`
- `textLength`

推断功能：

- 左侧目录树
- 章节排序
- 文本编辑
- 可能支持章节级操作、行级处理或改写 diff

同类产品设计建议：

- 左栏：项目、卷、章节、资料分类
- 中栏：正文编辑器
- 支持章节拖拽排序
- 支持章节字数、更新时间、状态标记

### 3.3 AI 聊天与写作辅助

可见关键词：

- `win_chat_panel`
- `chat_engine`
- `llm_client`
- `LlmMessage`
- `llm_base_url`
- `max_tokens`
- `prompt_tokens`
- `tool_use`
- `tool_call_result`
- `_chatOpenAISync`
- `_chatAnthropic`
- `clear_context`
- `clearOldMessages`
- `createNewSession`
- `saveSession`
- `deleteSession`

推断功能：

- AI 聊天面板
- 多会话管理
- 支持清空上下文
- 支持 OpenAI 兼容接口
- 支持 Anthropic 类接口
- 支持工具调用结果
- 支持 token 统计或用量限制

同类产品设计建议：

- 右侧 AI 面板常驻
- AI 可读取当前章节、选中文本、项目资料、人物卡、伏笔记录
- 支持“续写、改写、润色、总结、提炼、起名、剧情推演”等快捷动作
- 支持用户自定义 Base URL、API Key、模型、温度、最大输出长度

### 3.4 技能/提示词市场

可见关键词：

- `skill_manager`
- `skill_marketplace_dialog`
- `skill_marketplace_service`
- `MarketplaceSkill`
- `create_skill`
- `delete_skill`
- `skill_id`
- `skill_ids`
- `skill_list`
- `skill_lookup`
- `createBuiltinNovelWriterSkill`
- `createSkillCreatorSkill`
- `exportSkillsToZip`
- `importWebDavZip`
- `Uploading skills.zip`

推断功能：

- 内置技能
- 自定义技能
- 技能市场
- 技能导入导出
- 技能云端同步或上传

同类产品设计建议：

- 把“技能”设计为提示词模板 + 输入字段 + 可调用上下文
- 支持本地技能库
- 支持用户导入 `E:\Xx\文章记忆库`、`E:\Xx\小说提示词`
- 支持一键调用：文章改写、小说续写、去 AI 味、人物生成、伏笔检查

### 3.5 小说工具

可见关键词：

- `novel_tools`
- `novel_crawler_service`
- `novel_crawler_dialog`
- `name_generator_dialog`
- `Character`
- `outline`
- `writer`
- `creator`
- `AnySearchItem`
- `AnySearchResult`

推断功能：

- 小说写作工具集合
- 小说内容抓取或导入
- 起名器
- 大纲/人物相关能力
- 搜索辅助

同类产品设计建议：

- 人物卡：姓名、身份、目标、关系、状态、口癖、禁忌
- 世界观卡：势力、地点、规则、物品、时间线
- 伏笔卡：埋设章节、回收章节、状态
- 起名器：按性别、时代、题材、风格生成
- 大纲工具：总纲、分卷纲、章纲、冲突链

### 3.6 备忘录与资料管理

可见关键词：

- `memo_dialog`
- `memo_service`
- `MemoItem`
- `createMemo`
- `deleteMemo`
- `importMemosFromJson`
- `createMemosZip`
- `memos.zip`

推断功能：

- 备忘录
- 备忘录导入导出
- 备忘录备份

同类产品设计建议：

- 备忘录独立于正文
- 备忘录可以被 AI 引用
- 支持标签、收藏、按项目归档
- 支持“把这段灵感转成章纲/人物/伏笔”

### 3.7 导入导出

可见关键词：

- `docx_import_service`
- `word_export_service`
- `import_export_service`
- `exportNovel`
- `exportNovelToTxt`
- `exportNovelToWord`
- `exportNovelToZip`
- `exportToDesktop`
- `exportTxtToDesktop`
- `docx`
- `word`
- `TXT`
- `Zip`
- `pdf`
- `markdown`
- `ePub`

可确认或高度可信功能：

- DOCX 导入
- Word 导出
- TXT 导出
- ZIP 项目导出
- 可能识别或处理 Markdown、PDF、ePub 等格式

同类产品设计建议：

- 第一版优先支持：`.md`、`.txt`、`.docx`、项目 `.zip`
- 第二版支持：PDF 预览、ePub 导入、发布平台格式
- 导出时支持标题层级、章节编号、作者名、简介

### 3.8 WebDAV 同步

可见关键词：

- `webdav_service`
- `webdav_config`
- `webdav_sync_dialog`
- `webdav_sync_log`
- `SyncDirection`
- `SyncStatus`
- `PROPFIND`
- `MKCOL`
- `PUT`
- `upload`
- `download`
- `backup`
- `restore`
- `https://dav.jianguoyun.com/dav/`
- `[AppState] syncUpload called`
- `[AppState] syncDownload called`

推断功能：

- WebDAV 配置
- 上传同步
- 下载同步
- 同步日志
- 备份恢复
- 默认提示或兼容坚果云 WebDAV

同类产品设计建议：

- 先做本地项目
- 再做 WebDAV 同步
- 同步必须有冲突处理：本地较新、远端较新、双边修改
- 每次同步前自动生成本地快照

### 3.9 会员、公告、反馈、更新

可见关键词：

- `vip_service`
- `usage_limit_service`
- `announcement_service`
- `feedback_service`
- `heartbeat_service`
- `update_service`
- `is_vip`
- `is_contributor`
- `http://pay.openxz.cn/faka/vip.php`
- `http://pay.openxz.cn/faka/api_vip.php`
- `http://openxz.cn/api/index.php?action=feedback`

推断功能：

- 会员或贡献者状态
- 使用量限制
- 公告
- 反馈
- 心跳
- 检查更新

同类产品设计建议：

- 如果做给自己用，第一版不要做会员体系
- 如果后续公开发布，可以只保留更新检查、反馈入口和贡献者标识
- AI 用量直接由用户自己的 API Key 承担，更透明

## 4. 可能的界面信息架构

基于模块名推断，OpenWrite 的界面大概可以抽象为：

```text
应用主窗口
├─ 顶部标题栏/工具栏
│  ├─ 当前项目
│  ├─ 同步状态
│  ├─ 导入导出
│  ├─ 技能市场
│  └─ 设置
├─ 左侧目录面板
│  ├─ 项目列表
│  ├─ 卷/章节树
│  ├─ 资料/备忘入口
│  └─ 新建/删除/排序
├─ 中央写作面板
│  ├─ 正文编辑器
│  ├─ 字数统计
│  ├─ 章节标题
│  └─ 保存状态
└─ 右侧 AI 面板
   ├─ 会话列表
   ├─ 聊天输入
   ├─ 技能快捷入口
   ├─ 当前文件引用
   └─ 上下文清理/重新生成
```

## 5. 我们做同类软件时的第一版范围

如果目标是做一个原创的“本地 AI 写作工作台”，第一版建议只做这些：

### 5.1 必做

- 本地项目管理
- 章节目录树
- Markdown/纯文本编辑器
- 自动保存
- AI 侧边栏
- OpenAI 兼容 API 配置
- 本地提示词/技能库
- 从 `E:\Xx\文章记忆库` 和 `E:\Xx\小说提示词` 调用写作提示词
- TXT/Markdown 导出

### 5.2 第二阶段

- DOCX 导入导出
- WebDAV 同步
- 备忘录
- 人物/世界观/伏笔卡
- 章节摘要与上下文压缩
- 小说续写工作流
- 文章改写工作流

### 5.3 第三阶段

- 技能市场
- 多模型模型发现
- 小说爬虫/网页导入
- 发布到公众号/微博/X 等 Baoyu 技能联动
- 主题系统
- 更新检查

## 6. 原创产品命名建议

为了避免复制 OpenWrite 品牌，可以换成自己的产品名，例如：

- InkForge
- StoryDesk
- WriteFlow
- 文火写作台
- 开卷写作
- 墨台

如果它主要服务当前工作区，可以暂命名为：

```text
Xx Writer
```

## 7. 技术实现建议

优先路线：

- 前端/桌面：Tauri + React，或 Flutter
- 编辑器：Monaco、CodeMirror 6 或 Milkdown
- 本地存储：文件系统项目 + SQLite 索引
- AI 接口：OpenAI-compatible Chat Completions / Responses 兼容层
- 技能库：Markdown/YAML 文件
- 同步：后续接 WebDAV

如果目标是最快做出来，建议用：

```text
Tauri + React + SQLite + 文件夹项目结构
```

理由：

- Windows 打包轻
- 能直接访问本地文件
- 适合和 `E:\Xx` 现有提示词库联动
- UI 迭代比 Flutter 更快

## 8. 下一步开发建议

下一步可以进入“第二项”：做原创版产品设计和 MVP 方案。

建议输出：

- 产品名
- 第一版页面草图
- 数据目录结构
- 技术栈
- MVP 功能清单
- 7 天开发拆分


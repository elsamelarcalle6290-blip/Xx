# 小说去 AI 味 Skill（OpenWrite / 通用 Skill 包）

这是一个用于中文小说创作和改写的提示词 Skill 包，目标是让 AI 生成或润色的小说片段更像人类小说作者写出来，减少机器感、作文腔、文案腔和过度解释。

## 包内文件

```text
novel-humanize-skill-openwrite/
├─ SKILL.md                         # 通用 Agent Skill 主文件
├─ manifest.json                    # 通用导入元数据
├─ openwrite/
│  ├─ openwrite_prompts.json         # 提示词库 JSON
│  ├─ openwrite_prompts.md           # OpenWrite 可复制提示词合集
│  └─ quick_skill_prompt.txt         # 最常用的万能提示词
├─ prompts/
│  ├─ 00_master_prompt.md            # 总提示词
│  ├─ 01_chapter_design.md           # 章节设计
│  ├─ 02_scene_draft.md              # 场景正文生成
│  ├─ 03_ai_taste_audit.md           # 去 AI 味检查
│  ├─ 04_local_rewrite.md            # 局部重写
│  ├─ 05_dialogue_rewrite.md         # 台词专项
│  ├─ 06_emotion_to_action.md        # 情绪转动作细节
│  ├─ 07_detail_enhancer.md          # 生活细节增强
│  ├─ 08_humanize_paragraph.md       # 人味化改写
│  ├─ 09_final_polish.md             # 最终润色
│  ├─ 10_universal_rewrite.md        # 万能改写
│  └─ 11_workflow.md                 # 推荐组合用法
├─ examples/
│  └─ usage_examples.md              # 使用示例
└─ references/
   └─ style_rules.md                 # 风格规则说明
```

## OpenWrite 使用方法

由于不同版本的 OpenWrite 对“Skill / 提示词库 / 工作流”的导入格式可能不同，建议按下面顺序尝试：

### 方法一：直接导入 zip

如果你的 OpenWrite 支持 Skill 包或提示词包导入：

1. 打开 OpenWrite。
2. 找到“提示词库 / Skill / 工作流 / 自定义助手 / 导入”入口。
3. 选择本 zip 文件。
4. 导入后优先查看：
   - `SKILL.md`
   - `openwrite/openwrite_prompts.json`
   - `openwrite/openwrite_prompts.md`

### 方法二：复制单个提示词

如果 OpenWrite 不支持 zip 导入：

1. 解压 zip。
2. 打开 `openwrite/openwrite_prompts.md`。
3. 把需要的提示词复制到 OpenWrite 的自定义提示词库。
4. 最常用的是：
   - 万能改写提示词
   - 场景正文生成提示词
   - 去 AI 味检查提示词
   - 最终润色提示词

### 方法三：作为通用 Agent Skill 使用

如果你的工具支持 Agent Skills 标准：

1. 将整个文件夹放入工具的 skills 目录。
2. 保持文件夹内的 `SKILL.md` 不要改名。
3. 在写小说或改小说时，让 AI 使用 `novel-humanize-ai-removal` skill。

## 推荐使用顺序

```text
第一步：用“章节设计提示词”拆结构。
第二步：用“小说场景正文生成提示词”写草稿。
第三步：用“去 AI 味检查提示词”找问题。
第四步：用“局部重写提示词”修改问题段落。
第五步：用“最终润色提示词”统一风格。
```

## 最核心的一句话

不要把它改得更华丽，而是改得更像人写的：语言有呼吸，逻辑有迟疑，细节有生活痕迹，情绪不要说透。

# OpenWrite 导入说明

## 优先尝试

1. 在 OpenWrite 中找到“提示词库 / Skill / 工作流 / 自定义助手 / 导入”。
2. 选择这个 zip 文件。
3. 导入后查看是否出现“小说去AI味：人类创作习惯 Skill”。

## 如果 OpenWrite 不能识别 zip

1. 解压 zip。
2. 打开 `openwrite/openwrite_prompts.md`。
3. 复制你需要的提示词。
4. 粘贴到 OpenWrite 的自定义提示词库中。

## 如果 OpenWrite 支持 JSON 提示词导入

尝试导入：

```text
openwrite/openwrite_prompts.json
```

## 如果 OpenWrite 支持通用 Agent Skill

使用整个文件夹：

```text
novel-humanize-skill-openwrite/
```

入口文件：

```text
SKILL.md
```

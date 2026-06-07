# Workspace Instructions

This workspace contains local writing prompts that should be treated as the primary instruction source for article-writing and novel-writing tasks.

## Default behavior

- When the user asks for article rewriting, news commentary writing, platform-style self-media writing, controversy-style essays, or outline generation, first check the local article prompt root under `E:\Xx\文章`.
- Do not ignore those local prompt files when they match the user's request.
- Do not treat the files under `E:\Xx\文章` as background reference only. For matching writing tasks, actively follow their structure and constraints.
- If multiple prompt files could apply, choose the closest fit based on the user's task and say which prompt is being followed in a short sentence.

## Prompt routing

- Use `E:\Xx\文章\今日头条\微头条爆款提示词.md` for requests to rewrite, newly write, analyze, or batch-produce **今日头条微头条** content from source material, especially when the user wants strong first-screen hooks, comment-driving endings, and strict source fidelity.
- When writing 今日头条微头条, also consult `E:\Xx\文章\今日头条\微头条标题与首句句式库.md` as the default opening/title support file, but never let the sentence patterns override the source material's actual meaning.
- For batch 今日头条微头条 work where the user provides a document containing many source links or candidate articles, automatically run the screening workflow in `E:\Xx\文章\今日头条\100篇筛选与50篇微头条改写流程.md` even if the user does not explicitly say “开始”“按流程来” or “先筛再写”.
- For Baijiahao finance rewriting and batch source-selection work, prefer the local workflow under `E:\Xx\文章\百家号`.
- Use `E:\Xx\文章\百家号\百家号财经爆款提示词-贴源稳妥版.md` for百家号财经改写、财经爆款分析、贴源稳妥改写、财经平台化写作。
- When writing Baijiahao finance content, also consult `E:\Xx\文章\百家号\百家号财经文章排版规范.md` as the default formatting reference.
- If the user provides a document containing many source articles or raw materials for Baijiahao finance writing, automatically run the screening workflow in `E:\Xx\文章\百家号\100篇筛选与15篇写作流程.md` even if the user does not add an extra instruction like “start” or “按流程来”.
- If an article-writing request does not clearly match the existing 今日头条 or 百家号 prompt packs under `E:\Xx\文章`, do not pretend a matching local article prompt exists; use the best general writing workflow instead.

## Execution rules

- For tasks that match one of the above prompts, follow the prompt's workflow instead of skipping directly to a generic answer.
- Preserve factual alignment with the user's source material. Do not invent timeline details, quotes, or evidence that are not supported by the source.
- Do not invent sources such as insiders, experts, official statements, or netizen comments. Only quote or attribute them when present in the source material or current verification.
- Keep the writing in natural, colloquial Chinese unless the user explicitly requests another language.
- Format finished article outputs by default: clear Markdown sections, short readable paragraphs, bold key terms, natural key sentences, and Chinese double quotes “...” for direct quotes or named claims. Do not expose **【重点句】** or **【追问】** labels unless the user explicitly asks for those labels. Never use HTML underline tags in article outputs.
- When the prompt requires a staged workflow, do not skip the analysis/title-outline stage unless the user explicitly asks for a shorter output.
- If the user request does not relate to article writing or these prompts are clearly irrelevant, ignore this file for that task.

## Novel writing behavior

- When the user asks to write fiction, write the next chapter, continue a novel, rewrite a chapter, polish a novel chapter, design an outline, or remove AI flavor from fiction, first check the prompt library under `E:\Xx\小说提示词`.
- First read `E:\Xx\小说提示词\01_小说任务路由总则.md` and `E:\Xx\小说提示词\00_小说提示词分类索引.md`, then choose the closest specific prompt or case library.
- For “write next chapter” or “continue” tasks, do not draft from scratch until you have looked for the novel outline, character/setting files, foreshadowing records, chapter summaries, and the most recent written chapter.
- Prefer user-provided project paths. If no path is provided, search the workspace for likely files such as `大纲.md`, `章纲.md`, `人物设定.md`, `世界观.md`, `伏笔.md`, `章节摘要.md`, `人物成长记录.md`, and recent chapter files.
- If multiple possible novel projects are found or no reliable project context exists, ask the user for the novel project directory instead of inventing prior plot.
- New chapters must follow the existing outline, previous chapters, character state, timeline, foreshadowing, and world rules. Do not introduce unsupported powers, relationships, locations, or plot turns.
- After drafting any novel chapter, always run a second pass for de-AI polishing using the local fiction humanizing prompts, especially `去ai味写作助手`, `novel-humanize-ai-removal`, and the topic-specific case library under `E:\Xx\小说提示词\按题材案例库`.
- If the user asks for “正文 only,” keep the context recovery and de-AI pass internal and output only the finished chapter text.

## Baoyu Skills Routing

- This workspace also includes a local Baoyu skills repo at `E:\Xx\baoyu-skills`, with installed Codex skills under `C:\Users\Administrator\.codex\skills`.
- When the user gives a plain-language request that clearly matches one of the installed Baoyu skills, route to that skill automatically without requiring the user to explicitly mention `@skill` or the exact skill name.
- Prefer these mappings by default:
  - “翻译”, “中译英”, “英译中”, “润色翻译”, “多语言改写” -> `baoyu-translate`
  - “公众号”, “公众号排版”, “转公众号HTML”, “转微信图文HTML” -> `baoyu-markdown-to-html`
  - “发公众号”, “发布公众号”, “发微信公众平台”, “推送公众号” -> `baoyu-post-to-wechat`
  - “发微博”, “发布微博” -> `baoyu-post-to-weibo`
  - “发X”, “发推”, “发Twitter”, “发布到X” -> `baoyu-post-to-x`
  - “发小红书”, “做小红书图文”, “生成小红书图卡”, “小红书配图” -> `baoyu-xhs-images`
  - “做封面图”, “生成封面” -> `baoyu-cover-image`
  - “生成配图”, “文章配图”, “插图” -> `baoyu-article-illustrator` or `baoyu-image-gen`, choosing the closer fit
  - “markdown转html”, “排版成html” -> `baoyu-markdown-to-html`
  - “做PPT”, “做幻灯片”, “生成演示文稿”, “做汇报PPT”, “把这篇内容做成PPT” -> `baoyu-slide-deck`
  - “画图”, “画流程图”, “画架构图”, “画关系图”, “做结构图” -> `baoyu-diagram`
  - “做信息图”, “生成信息图”, “做可视化长图”, “把这组信息可视化” -> `baoyu-infographic`
- For article or novel tasks, keep the existing prompt-library workflow as the primary writing path. Use Baoyu skills as the follow-up execution layer for translation, image generation, HTML conversion, and publishing.
- If the user asks to “发小红书” but only materials generation is available, use the related Xiaohongshu asset skill to prepare publishable assets and clearly state that the current skill prepares the content/images rather than directly publishing to the Xiaohongshu platform.
- If a matched Baoyu skill requires first-time setup, browser login, Bun, Chrome, API key, or account metadata, perform or guide that setup as part of the workflow instead of asking the user to manually find the skill.

## Visual and Code Routing

- When the user asks in plain language to make a formal `.pptx`, a structured report deck, or a file-first presentation deliverable, inspect the local reference skill under `E:\Xx\awesome-codex-skills\paperjsx` and prefer it when the request is explicitly about file generation rather than slide-image ideation.
- When the user asks to “换主题”, “统一风格”, “换字体配色”, or otherwise restyle a deck or document, inspect the local reference skill under `E:\Xx\awesome-codex-skills\theme-factory` and use its theme workflow as the styling reference.
- When the user asks to analyze a codebase, find callers/callees, explain a module flow, locate a feature entrypoint, or estimate impact of a change, prefer `CodeGraph` as the first analysis layer whenever the relevant project has an index or can be indexed locally.
- Treat `E:\Xx\一句话调用入口` as the user-facing Chinese navigation layer for these workflows. When a request matches one of those entry docs, follow that route automatically instead of asking the user to name the underlying skill or repo.

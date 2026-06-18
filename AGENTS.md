# Workspace Instructions

This workspace contains local writing prompts that should be treated as the primary instruction source for article-writing, novel-writing, and short-video copywriting tasks.

## Default behavior

- When the user asks for article rewriting, news commentary writing, platform-style self-media writing, controversy-style essays, or outline generation, first check the local article prompt root under `E:\Xx\文章`.
- Do not ignore those local prompt files when they match the user's request.
- Do not treat the files under `E:\Xx\文章` as background reference only. For matching writing tasks, actively follow their structure and constraints.
- If multiple prompt files could apply, choose the closest fit based on the user's task and say which prompt is being followed in a short sentence.
- When the user asks for short-video copywriting, oral scripts,口播文案,口播内容,文案内容,文案优化, or directly pastes a likely short-video script, first check the local short-video prompt root under `E:\Xx\短视频`.

## Prompt routing

- For all article-writing tasks, first use `E:\Xx\文章\00_文章任务路由总则.md` as the entry router. Platform files and style modules are selected through this router; do not let `联网核验版时事改写总提示词.md` replace the other prompt files.
- Use `E:\Xx\文章\微头条\50篇文章.md` for requests to rewrite, newly write, analyze, or batch-produce **今日头条微头条** content from source material, especially when the user wants strong first-screen hooks, comment-driving endings, strict source fidelity, and the current “规则公平 / 利益代入 / 反差解释”争议入口 workflow.
- For 今日头条微头条, choose the争议入口 first, then write the final micro-headline with enough detail to tell the event clearly and drive comments. Principle is no less than 1000 Chinese characters when the source supports it, but do not pad with empty viewpoints or repeated abstract discussion. If the source is too thin, use web enrichment/source verification first; if it still cannot support a complete human-readable draft, downgrade or report that the source is insufficient instead of producing a hollow draft.
- For batch 今日头条微头条 work where the user provides a document containing many source links or candidate articles, use the screening and source-fidelity workflow inside `E:\Xx\文章\微头条\50篇文章.md` even if the user does not explicitly say “开始”“按流程来” or “先筛再写”. Default output count is 50 articles unless the user specifies another count.
- Use `E:\Xx\文章\百家号\15篇文章.md` for百家号财经改写、财经爆款分析、贴源稳妥改写、财经平台化写作。
- For Baijiahao finance content, keep one article to one main line: every paragraph should advance the same core question, with clear transitions rather than jumping from A to B without explanation. Direct Baijiahao outputs should be exactly one 40-60 Chinese-character title followed by the body, with no visible section labels such as “引言”“事件回顾”“目前结果或最新状态”“事例分析”“写在最后”.
- For finance, brokerage, dividend, A-share regulation, market-structure, or investor-protection commentary, first follow `E:\Xx\文章\00_文章任务路由总则.md`; when the router calls for it, use the “财经热点人话降温版” section in `E:\Xx\文章\联网核验版时事改写总提示词.md` as the style module.
- If the user provides a document containing many source articles or raw materials for Baijiahao finance writing, automatically run the screening and source-fidelity workflow inside `E:\Xx\文章\百家号\15篇文章.md` even if the user does not add an extra instruction like “start” or “按流程来”. Default output count is 15 articles unless the user specifies another count.
- Use `E:\Xx\文章\微信公众号\3篇文章.md` for微信公众号长文改写、公众号评论文、公众号财经/资产类长文、适合转发收藏的公众号平台化写作。
- For direct WeChat Official Account outputs, use one 24-40 Chinese-character title as the first line, then the body after one blank line. Do not output visible process notes, Markdown symbols, or template labels such as “引言”“事件回顾”“目前结果或最新状态”“事例分析”“写在最后”.
- If the user provides a document containing many source links or candidate source articles for WeChat Official Account writing, automatically run the screening and source-fidelity workflow inside `E:\Xx\文章\微信公众号\3篇文章.md` even if the user does not explicitly say “开始”“按流程来” or “先筛再写”. Default output count is 3 articles unless the user specifies another count.
- If an article-writing request does not clearly match the existing 今日头条, 百家号, or 微信公众号 prompt packs under `E:\Xx\文章`, do not pretend a matching local article prompt exists; use the best general writing workflow instead.

## Execution rules

- For tasks that match one of the above prompts, follow the prompt's workflow instead of skipping directly to a generic answer.
- Preserve factual alignment with the user's source material. Do not invent timeline details, quotes, or evidence that are not supported by the source.
- Do not invent sources such as insiders, experts, official statements, or netizen comments. Only quote or attribute them when present in the source material or current verification.
- For article-writing tasks based on links, current events, finance, policy, international affairs, market moves, company actions, or thin source material, perform web search/source verification before writing unless the user explicitly says not to browse. Use web results to enrich facts, timelines, background, latest developments, and impact paths while keeping the user's original source as the thematic anchor.
- Web enrichment must not turn the assignment into a different article: only add public, verifiable information directly related to the original core issue. Do not pad with loosely related background, rumors, unsupported screenshots, invented expert opinions, invented netizen comments, or unverified market claims.
- Each platform prompt contains source-fidelity constraints that outrank all 爆款 techniques. Before finalizing any article, run three gates internally: (1) separate original-source facts, web-verified facts, and your own inferences; (2) delete any concrete number, date, name, institution, causal claim, or quote that cannot map back to the source or a verifiable source; (3) search only the same event/subject as the original, prefer official/regulator/exchange/company filing/financial report/authoritative media sources, and never treat rumors, second-hand screenshots, or marketing-account reposts as facts. For batch jobs, never carry one article's source material into another.
- Keep the writing in natural, colloquial Chinese unless the user explicitly requests another language.
- Format finished article outputs by default as clean publishable plain text: short readable paragraphs, natural key sentences, and Chinese double quotes “...” for direct quotes or named claims. Do not expose Markdown control symbols such as `**`, `###`, `-`, or similar markers in the final article text unless the user explicitly asks for markup. Do not expose labels like `【重点句】` or `【追问】` unless the user explicitly asks for them. Do not write phrases such as “原帖”“原文说”“这篇内容提到”“原文章里写到” that reveal the rewrite process. Never use HTML underline tags in article outputs.
- When the prompt requires a staged workflow, do not skip required screening or internal planning. For direct publishable article requests, keep analysis, outline, source checking, title alternatives, and workflow notes internal unless the user explicitly asks to see them; final article outputs should obey the closest prompt file's direct-output mode.
- If the user request does not relate to article writing or these prompts are clearly irrelevant, ignore this file for that task.

## Short Video Copywriting Behavior

- When the user says “口播文案”, “口播内容”, “文案内容”, “文案”, “短视频文案”, “短视频口播”, “帮我改一下这段文案”, “帮我优化这段口播”, “把这段话改成短视频文案”, or directly pastes a likely short-video oral script, automatically use the local short-video workflow.
- First read `E:\Xx\短视频\短视频文案调用说明.md`, then follow `E:\Xx\短视频\短视频文案改写提示词.md`.
- If the user provides a target platform, audience, style, duration, word count, tone, or禁区, follow the user's specific requirement first.
- If the user only provides copy without extra instruction, default to short-video oral-script micro-polishing, not heavy rewriting.
- Preserve the original core meaning and topic. Do not invent facts,人物、数据、时间线、案例、承诺、功效, or claims that are not present in the user's material.
- Optimize oral fluency, sentence rhythm, pauses, and naturalness while keeping the original structure and wording as much as possible.
- Default edit distance should stay small: do not change more than about 30 percent of the source copy unless the user explicitly asks for “重写”, “大改”, “爆款改写”, or “重新写一版”.
- Output clean usable copy directly. Do not expose workflow notes, prompt names, Markdown control symbols, or phrases like “我正在调用提示词”.
- Ask a question only when the source copy is missing, the requested style conflicts with the content, or the topic involves high-risk medical, legal, financial, privacy, or minor-related claims with insufficient source support.

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

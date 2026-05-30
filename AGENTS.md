# Workspace Instructions

This workspace contains local writing prompts that should be treated as the primary instruction source for article-writing and novel-writing tasks.

## Default behavior

- When the user asks for article rewriting, news commentary writing, controversy-style essays, outline generation, or long-form self-media content creation, first check the prompt library under `E:\Xx\文章记忆库`.
- Do not ignore those local prompt files when they match the user's request.
- Do not treat the files in `文章记忆库` as background reference only. For matching writing tasks, actively follow their structure and constraints.
- If multiple prompt files could apply, choose the closest fit based on the user's task and say which prompt is being followed in a short sentence.

## Prompt routing

- First read `E:\Xx\文章记忆库\00_文章任务路由总则.md` and `E:\Xx\文章记忆库\01_文章排版输出规范.md` for article-writing tasks, then choose the closest specific prompt.
- Use `E:\Xx\文章记忆库\3000字总分式爆款改写提示词.md` as the first-choice prompt when the user provides source material and asks for rewriting, original rewriting, viral/self-media long-form writing, 3000-word articles, clear timelines, plain-language style, or low-AI-flavor Chinese prose.
- For time-sensitive topics, latest news, policy/data/ranking/personnel/company/international updates, still verify current public information before writing. After verification, keep `E:\Xx\文章记忆库\3000字总分式爆款改写提示词.md` as the first-choice writing prompt when the task is source-material rewriting or long-form self-media writing. Do not use a standalone verification prompt.
- Use `E:\Xx\文章记忆库\时事文章原创改写总提示词.md` for requests to rewrite or newly write a current-events article from source material, especially when the user wants a long-form article, clear timeline, strong originality, and colloquial Chinese.
- Use `E:\Xx\文章记忆库\二段式争议文章写作总提示词.md` for event-driven controversy articles where the source has a clear incident, parties, conflict, process, result, or public reaction.
- Use `E:\Xx\文章记忆库\二段式争议论说文写作提示词.md` for viewpoint-driven controversy essays focused on a public issue, value judgment, social phenomenon, or argumentative discussion.
- Use `E:\Xx\文章记忆库\今日头条爆款改写提示词.md` when the user explicitly wants to analyze a Toutiao-style viral article and rewrite it with lower similarity while preserving the core idea.

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
- For article or novel tasks, keep the existing prompt-library workflow as the primary writing path. Use Baoyu skills as the follow-up execution layer for translation, image generation, HTML conversion, and publishing.
- If the user asks to “发小红书” but only materials generation is available, use the related Xiaohongshu asset skill to prepare publishable assets and clearly state that the current skill prepares the content/images rather than directly publishing to the Xiaohongshu platform.
- If a matched Baoyu skill requires first-time setup, browser login, Bun, Chrome, API key, or account metadata, perform or guide that setup as part of the workflow instead of asking the user to manually find the skill.

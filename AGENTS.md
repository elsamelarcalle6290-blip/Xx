# Workspace Instructions

This workspace contains local writing prompts that should be treated as the primary instruction source for article-writing tasks.

## Default behavior

- When the user asks for article rewriting, news commentary writing, controversy-style essays, outline generation, or long-form self-media content creation, first check the prompt library under `E:\Xx\文章记忆库`.
- Do not ignore those local prompt files when they match the user's request.
- Do not treat the files in `文章记忆库` as background reference only. For matching writing tasks, actively follow their structure and constraints.
- If multiple prompt files could apply, choose the closest fit based on the user's task and say which prompt is being followed in a short sentence.

## Prompt routing

- First read `E:\Xx\文章记忆库\00_文章任务路由总则.md` and `E:\Xx\文章记忆库\01_文章排版输出规范.md` for article-writing tasks, then choose the closest specific prompt.
- Use `E:\Xx\文章记忆库\联网核验版时事改写总提示词.md` for time-sensitive topics, latest news, policy/data/ranking/personnel/company/international updates, or any task that needs current public information checked before writing.
- Use `E:\Xx\文章记忆库\时事文章原创改写总提示词.md` for requests to rewrite or newly write a current-events article from source material, especially when the user wants a long-form article, clear timeline, strong originality, and colloquial Chinese.
- Use `E:\Xx\文章记忆库\二段式争议文章写作总提示词.md` for event-driven controversy articles where the source has a clear incident, parties, conflict, process, result, or public reaction.
- Use `E:\Xx\文章记忆库\二段式争议论说文写作提示词.md` for viewpoint-driven controversy essays focused on a public issue, value judgment, social phenomenon, or argumentative discussion.
- Use `E:\Xx\文章记忆库\今日头条爆款改写提示词.md` when the user explicitly wants to analyze a Toutiao-style viral article and rewrite it with lower similarity while preserving the core idea.

## Execution rules

- For tasks that match one of the above prompts, follow the prompt's workflow instead of skipping directly to a generic answer.
- Preserve factual alignment with the user's source material. Do not invent timeline details, quotes, or evidence that are not supported by the source.
- Do not invent sources such as insiders, experts, official statements, or netizen comments. Only quote or attribute them when present in the source material or current verification.
- Keep the writing in natural, colloquial Chinese unless the user explicitly requests another language.
- Format finished article outputs by default: clear Markdown sections, short readable paragraphs, bold key terms, use **【重点句】** or **【追问】** for the most important judgment/question, and use Chinese double quotes “...” for direct quotes or named claims. Never use HTML underline tags in article outputs.
- When the prompt requires a staged workflow, do not skip the analysis/title-outline stage unless the user explicitly asks for a shorter output.
- If the user request does not relate to article writing or these prompts are clearly irrelevant, ignore this file for that task.

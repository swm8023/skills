# Signs of AI Writing

[![A screenshot of ChatGPT reading: "[header] Legacy & Interpretation [body] The "Black Hole Edition" is not just a meme — it's a celebration of grassroots car culture, where ideas are limitless and fun is more important than spec sheets. Whether powered by a rotary engine, a V8 swap, or an imagined fighter jet turbine, the Miata remains the canvas for car enthusiasts worldwide."](https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/ChatGPT_response_screenshot_1.jpg/250px-ChatGPT_response_screenshot_1.jpg)](https://en.wikipedia.org/wiki/File:ChatGPT_response_screenshot_1.jpg)

*LLM 的写作风格往往可以辨认。*

本页列出 [AI 聊天机器人](https://en.wikipedia.org/wiki/AI_chatbot "AI chatbot")（例如 [ChatGPT](https://en.wikipedia.org/wiki/ChatGPT "ChatGPT")）常见的写作和排版习惯，并引用 Wikipedia 条目和草稿中的真实示例。这是一份帮助识别 Wikipedia 上[未披露的 AI 生成内容](https://en.wikipedia.org/wiki/Wikipedia:LLMDISCLOSE "Wikipedia:LLMDISCLOSE")的[实用指南](https://en.wikipedia.org/wiki/Field_guide "Field guide")。本清单属于*描述*，而非*规定*；它记录观察结果，并不制定规则。Wikipedia 条目应避免哪些语言和格式，可查阅[方针与指引](https://en.wikipedia.org/wiki/Wikipedia:PAG "Wikipedia:PAG")以及[格式手册](https://en.wikipedia.org/wiki/Wikipedia:MOS "Wikipedia:MOS")，这些规范不属于本页内容。

本清单*并非*禁止某些词、短语或标点。出现这些迹象的文本，不一定由 AI 生成，因为驱动聊天机器人的[大型语言模型](https://en.wikipedia.org/wiki/Large_language_model "Large language model")接受了人类文字的训练，其中也包括 Wikipedia 编辑的文字。这只是对数千例 AI 文本中常见模式的汇总，*专门针对 Wikipedia*。有些建议适用于更广泛场景，但部分迹象，尤其标点和排版相关迹象，未必适用于 Wikipedia 以外的环境。

这里的模式也只是问题的潜在*迹象*，而非*问题本身*。过度加粗、用词与标点不佳、标记损坏、引用格式古怪等表面问题明显且容易修复，却可能暗示[更严重的方针风险](https://en.wikipedia.org/wiki/Wikipedia:AIFAIL "Wikipedia:AIFAIL")。LLM 文本如果从一开始或经后期润色足够精致，可能没有表面缺陷，却仍存在深层问题。不要只修补这些迹象，否则只会让识别更困难。真正需要处理的是深层问题；请自行解决，或依照 [Wikipedia:Large language models §Handling suspected LLM-generated content](https://en.wikipedia.org/wiki/Wikipedia:Large_language_models#Handling_suspected_LLM-generated_content "Wikipedia:Large language models") 和 [Wikipedia:WikiProject AI Cleanup/Guide](https://en.wikipedia.org/wiki/Wikipedia:WikiProject_AI_Cleanup/Guide "Wikipedia:WikiProject AI Cleanup/Guide") 的建议标记出来。

[快速删除方针](https://en.wikipedia.org/wiki/Wikipedia:Speedy_deletion "Wikipedia:Speedy deletion")中的 [G15](https://en.wikipedia.org/wiki/Wikipedia:G15 "Wikipedia:G15") 标准（未经人类审阅的 LLM 生成页面），只适用于最客观、最无争议的生成迹象，共有三种：第一种见[面向用户的沟通](#communication-intended-for-the-user)，其余两种见[引用](#citations)。

不要只依赖 [AI 内容检测](https://en.wikipedia.org/wiki/Artificial_intelligence_content_detection "Artificial intelligence content detection")工具（如 [GPTZero](https://en.wikipedia.org/wiki/GPTZero "GPTZero")）判断文本是否由 LLM 生成。它们虽优于随机猜测，但错误率不低，不能代替人工判断。[^1] 改写、空格变化等文本修改，以及使用检测器训练时没见过的生成模型，都可能影响结果。[^2] 同样，也不要过分相信自己的判断。研究显示，重度使用 LLM 的人识别 AI 文章的准确率约为 90%；也就是说，即使你是专家用户，标记 10 个 AI 页面时，也可能误指控了一位编辑。[^3] 不常使用 LLM 的人，识别 AI 文章的表现只略优于随机猜测，正反方向均如此。[^3]

---

## Regression to the Mean

LLM（以及一般的[人工神经网络](https://en.wikipedia.org/wiki/Artificial_neural_network "Artificial neural network")）根据大量训练资料，用统计算法猜测、推断接下来应出现什么。因此它们容易[回归均值](https://en.wikipedia.org/wiki/Regression_to_the_mean "Regression to the mean")：结果趋向统计上最可能、适用范围最广的表达。这既可能是优点，也可能成为识别 AI 内容的线索。

例如，LLM 常用互联网资料训练，名人通常被描述得正面而重要。因此模型往往省略具体、独特、细腻的事实（统计上少见），替换成笼统的正面描述（统计上常见）。具体的“首个列车连接装置的发明者”，可能变成“引领变革的工业巨擘”。就像不断高声宣称肖像中的人独一无二、举足轻重，画像本身却从清晰照片变成模糊而普通的素描：内容越来越不具体，语气却越来越夸张。[^4]

这种回归均值，将具体事实磨平成可适用于许多主题的概括，也让 AI 内容更容易辨认。

### Undue emphasis on symbolism, legacy, and importance

**需注意的词：** *stands/serves as*, *is a testament/reminder*, *plays a vital/significant/crucial/pivotal role*, *underscores/highlights its importance/significance*, *reflects broader*, *symbolizing its ongoing/enduring/lasting impact*, *key turning point*, *indelible mark*, *deeply rooted*, *profound heritage*, *steadfast dedication*...

LLM 常添加陈述，声称主题的任意方面如何代表或贡献于更宏大的话题，以此夸大主题的重要性。[^5] 这类陈述有一套独特、容易辨认的写法。[^6]

> The Statistical Institute of Catalonia was officially established in 1989, marking a pivotal moment in the evolution of regional statistics in Spain. [...]
>
> The founding of Idescat represented a significant shift toward regional statistical independence, enabling [Catalonia](https://en.wikipedia.org/wiki/Catalonia "Catalonia") to develop a statistical system tailored to its unique socio-economic context. This initiative was part of a broader movement across Spain to decentralize administrative functions and enhance regional governance.

> Kumba has long been an important center for trade and agriculture. [...] The establishment of road networks connecting Kumba to other parts of the Southwest Region, such as Mamfe and Buea, helped solidify its role as a regional hub.

即使词源、人口数据等普通主题，LLM 也可能加入这种陈述。有时先用缓和开场承认主题不重要或鲜为人知，随后照样谈论其重要性。

**示例**

> During the [Spanish colonial period](https://en.wikipedia.org/wiki/Spanish_Colonial_Period_(Philippines) "Spanish Colonial Period (Philippines)"), the name *Bakunutan* was hispanized to *Bacnotan*, a modification reflected in official documents preserved in the [National Archives](https://en.wikipedia.org/wiki/National_Archives_of_the_Philippines "National Archives of the Philippines") in Manila. This etymology highlights the enduring legacy of the community's resistance and the transformative power of unity in shaping its identity.

> Though it saw only limited application, it contributes to the broader history of early aviation engineering and reflects the influence of French rotary designs on German manufacturers.

谈论生物（如某种动植物）时，LLM 常过度强调它与整个生态系统或环境的关系，即使这种联系牵强或泛泛。它也倾向反复讨论保护现状、研究和保育努力，即使保护状况未知、实际上没有认真开展相关工作。

**示例**

> It plays a role in the ecosystem and contributes to Hawaii's rich cultural heritage. [...] Preserving this endemic species is vital not only for ecological diversity but also for sustaining the cultural traditions connected to Hawaii's native flora.

> Currently, there is no specific conservation assessment for *Lethrinops lethrinus* by the International Union for Conservation of Nature (IUCN). However, the general health of the Lake Malawi ecosystem is crucial for the survival of this and other endemic species. Factors such as overfishing, pollution, and habitat destruction could potentially impact their populations.

### Undue emphasis on notability, attribution, and media coverage

**需注意的词：** *independent coverage*, *local/regional/national/[country name] media outlets*, *music/business/tech outlets*, *active social media presence*

类似地，LLM 似乎认为，证明主题值得关注的最好方式，是不断强调其知名度，通常会列举报道过它的来源。有时补充来源实际说了什么，有时不补充，还常把自己的[表面分析](#superficial-analyses)错误归给来源。较新的 AI 工具（2025 年或以后）更常出现这种现象。

人类新闻稿几十年来也引用新闻剪报，但被明确要求撰写 Wikipedia 条目的 LLM，常会照搬 [Wikipedia 指引](https://en.wikipedia.org/wiki/Wikipedia:N "Wikipedia:N")的措辞，例如“independent coverage”。

**示例**

> She spoke about AI on CNN, and was featured in Vogue, Wired, Toronto Star, and other media. [...] Her insights have also been featured in *Wired*, *Refinery29*, and other prominent media outlets.

> Her views have been cited in *The New York Times*, *BBC*, *Financial Times*, and *The Hindu*.

> Its significance is documented in archived school event programs and regional press coverage, including the *Mesabi Daily News*, which regularly reviewed performances held there.

尤其在 Wikipedia，LLM 常在正文中费力强调来源，哪怕只是零星报道、没有争议的事实，或人类编辑通常仅放行内引文、甚至不引来源的情况。

**示例**

> The restaurant has also been mentioned in [ABC News](https://en.wikipedia.org/wiki/ABC_News_(Australia) "ABC News (Australia)") coverage relating to incidents in the surrounding precinct, underscoring its role as a well-known late-night venue in the city [of [Adelaide](https://en.wikipedia.org/wiki/Adelaide "Adelaide")].

> In the United States, university-based incubators and accelerators have expanded alongside these centers; an official Library of Congress review found that 31.5% of SBA [[Small Business Administration](https://en.wikipedia.org/wiki/Small_Business_Administration "Small Business Administration")] Growth Accelerator Fund Competition winners from 2014–2016 were university-based programs.

涉及使用社交媒体的人物或实体时，LLM 常说它们“maintain an active social media presence”或类似话。这种措辞很有 AI 特色，在约 2024 年前的 Wikipedia 中相对少见。

> The mall maintains a strong digital presence, particularly on Instagram, where it actively shares the latest updates and events. Forum Kochi has consistently demonstrated excellence in digital promotions, with high-quality, engaging, and impactful video content playing a key role in its outreach.

### Superficial analyses

**需注意的词：** *ensuring ...*, *highlighting ...*, *emphasizing ...*, *reflecting ...*, *underscoring ...*, *showcasing ...*, *aligns with...*, *contributing to...*

AI 聊天机器人常插入表面分析，讨论信息的重要性、认可度或影响。[^7] 常见方式是在句末加一个[现在分词](https://en.wikipedia.org/wiki/Participle#Forms "Participle")（“-ing”）短语，有时还[模糊归因](#vague-attributions-of-opinion)于第三方（见下文）。[^7][^5]

虽然[许多这类词本身就是明显的 AI 迹象](https://en.wikipedia.org/wiki/Wikipedia:AIWORDS "Wikipedia:AIWORDS")，[^6][^8] 如果动词主语是事实、事件或其他无生命事物，迹象就更明显。人可以 highlight 或 emphasize 某事，事实、事件本身却不能。这种“突出”“强调”并不是实际发生的动作，而是一个没有实体的叙述者，对某件事意味着什么作出断言。[^5]

这类评论通常构成[综合推论](https://en.wikipedia.org/wiki/Wikipedia:SYNTH "Wikipedia:SYNTH")，或以百科全书口吻表达未归因的意见。具有[检索增强生成](https://en.wikipedia.org/wiki/Retrieval-augmented_generation "Retrieval-augmented generation")能力的新聊天机器人（例如能搜索网络的工具），可能将这些断言挂到[具名来源](#undue-emphasis-on-notability-attribution-and-media-coverage)名下，例如“Roger Ebert highlighted the lasting influence”，而不论来源是否说过近似内容。

**示例**

> Douera enjoys close proximity to the capital city, Algiers, further enhancing its significance as a dynamic hub of activity and culture.

> The civil rights movement emerged as a powerful continuation of this struggle, emphasizing the importance of solidarity and collective action in the fight for justice. This historical legacy has influenced contemporary African-American families, shaping their values, community structures, and approaches to political engagement. Economically, the enduring impacts of systemic inequality have led to both challenges and innovations within African-American communities, driving a commitment to empowerment and social change that echoes through generations.

> Its bilingual monument sign, with inscriptions in both English and Spanish, underscores its role in bringing together Latter-day Saints from the United States and Mexico.

> These citations, spanning more than six decades and appearing in recognized academic publications, illustrate Blois' lasting influence in computational linguistics, grammar, and neology.

> It holds a pivotal place in the [East Central Railway Zone](https://en.wikipedia.org/wiki/East_Central_Railway_Zone "East Central Railway Zone") of [Indian Railways](https://en.wikipedia.org/wiki/Indian_Railways "Indian Railways"), serving as a major railway hub with historical significance. The station has [1,676 mm](https://en.wikipedia.org/wiki/5_ft_6_in_gauge_railway "5 ft 6 in gauge railway") (5 ft 6 in) [broad gauge](https://en.wikipedia.org/wiki/Broad_gauge "Broad gauge") along with 8 tracks and 6 platforms. [...] Historically, it has been crucial for linking [Darbhanga](https://en.wikipedia.org/wiki/Darbhanga "Darbhanga") with significant cities like [Delhi](https://en.wikipedia.org/wiki/Delhi "Delhi"), [Patna](https://en.wikipedia.org/wiki/Patna "Patna"), and [Kolkata](https://en.wikipedia.org/wiki/Kolkata "Kolkata"), facilitating the movement of passengers and goods. The station has supported various services, including passenger trains and express trains like the [Satyagrah Express](https://en.wikipedia.org/wiki/Satyagrah_Express "Satyagrah Express") and [Mithila Express](https://en.wikipedia.org/wiki/Mithila_Express "Mithila Express"), contributing to the socio-economic development of the region. [...] Over the years, Darbhanga Junction has seen several upgrades and modernization efforts aimed at improving facilities and operational efficiency, reflecting its continued relevance in the regional and national transportation landscape.

### Promotional and advertisement-like language

**需注意的词：** *continues to captivate*, *groundbreaking* (in the figurative sense), *stunning natural beauty*, *enduring/lasting legacy*, *nestled*, *in the heart of*, *boasts a*...

LLM 很难保持中立语气，尤其涉及可视为“文化遗产”的事物时，会[不断提醒读者它有多重要](#undue-emphasis-on-symbolism-legacy-and-importance)。

**示例**

> Nestled within the breathtaking region of Gonder in Ethiopia, Alamata Raya Kobo stands as a vibrant town with a rich cultural heritage and a significant place within the Amhara region. From its scenic landscapes to its historical landmarks, Alamata Raya Kobo offers visitors a fascinating glimpse into the diverse tapestry of Ethiopia. In this article, we will explore the unique characteristics that make Alamata Raya Kobo a town worth visiting and shed light on its significance within the Amhara region.

> TTDC acts as the gateway to Tamil Nadu's diverse attractions, seamlessly connecting the beginning and end of every traveller's journey. It offers dependable, value-driven experiences that showcase the state's rich history, spiritual heritage, and natural beauty.

同样，LLM 也会在公司、商业和产品文字中加入宣传性、正面的措辞，使其像电视广告台词。

> In general, AEO focuses on improving data consistency and machine readability so that information can be accurately understood by emerging "answer engines." Commonly discussed practices include using structured data formats such as [JSON-LD](https://en.wikipedia.org/wiki/JSON-LD "JSON-LD") and [schema.org](https://en.wikipedia.org/wiki/Schema.org "Schema.org"), maintaining the freshness and accuracy of published information, and aligning digital entities with open web standards like [Wikidata](https://en.wikipedia.org/wiki/Wikidata "Wikidata") and Schema.org.

> The SOLLEI's exterior design communicates a powerful emotional presence, staying true to Cadillac's signature bold proportions. Its low, elongated silhouette is highlighted by a wide stance and an extended coupe door, which enhances accessibility to the spacious rear cabin. Smooth, uninterrupted surfaces and a pronounced A-line accentuate the vehicle's overall length, while a sleek, low tail imparts a sense of refined dynamism. A mid-body line runs seamlessly from the headlamps to the taillights, reinforcing the car's cohesive and elegant design. Traditional door handles have been replaced with discrete buttons, preserving the vehicle's clean and modern profile. In a nod to Cadillac's legacy of bold color choices, the exterior is finished in "Manila Cream"—a distinctive hue originally offered in 1957 and 1958. This heritage color has been thoughtfully revived and hand-painted by Cadillac artisans, showcasing the brand's dedication to craftsmanship and historical reverence.

### Didactic, editorializing disclaimers

**需注意的词：** *it's important/critical/crucial to note/remember/consider*, *may vary*...

LLM 常告诉读者哪些事情“务必记住”。这通常表现为对假想读者添加“免责声明”，涉及安全、争议话题，或解释不同地区、司法辖区中的差别。

**示例**

> The emergence of these informal groups reflects a growing recognition of the interconnected nature of urban issues and the potential for ANCs to play a role in shaping citywide policies. However, it's important to note that these caucuses operate outside the formal ANC structure and their influence on policy decisions may vary.

> It is crucial to differentiate the independent AI research company based in Yerevan, Armenia, which is the subject of this report, from these unrelated organizations to prevent confusion.

> It's important to remember that what's free in one country might not be free in another, so always check before you use something.

### Summaries and conclusions

**需注意的词：** *In summary*, *In conclusion*, *Overall*...

生成较长内容（例如被要求“写一篇文章”）时，LLM 常添加“Conclusion”或类似章节，也常用重述核心观点的方式结束段落或章节。[^9]

**示例**

> In summary, the educational and training trajectory for nurse scientists typically involves a progression from a master's degree in nursing to a Doctor of Philosophy in Nursing, followed by postdoctoral training in nursing research. This structured pathway ensures that nurse scientists acquire the necessary knowledge and skills to engage in rigorous research and contribute meaningfully to the advancement of nursing science.

### Outline-like conclusions about challenges and future prospects

**需注意的词：** *Despite its... faces several challenges...*, *Despite these challenges*, *Challenges and Legacy*, *Future Outlook*...

许多 LLM 生成的 Wikipedia 条目都有“Challenges”章节，通常以“尽管具有[正面或宣传性优点]，[主题]仍面临挑战……”开头，最后要么泛泛作出积极评价，[^1] 要么猜测现有或未来举措如何带来好处。它们通常出现在结构僵硬的条目末尾，还可能另列“Future Prospects”章节。

注意：这个迹象指僵硬套式，而不是单纯提及挑战。

**示例**

> Despite its industrial and residential prosperity, Korattur faces challenges typical of urban areas, including[...] With its strategic location and ongoing initiatives, Korattur continues to thrive as an integral part of the Ambattur industrial zone, embodying the synergy between industry and residential living.

> Despite its success, the Panama Canal faces challenges, including[...] Future investments in technology, such as automated navigation systems, and potential further expansions could enhance the canal's efficiency and maintain its relevance in global trade.

> Despite their promising applications, pyroelectric materials face several challenges that must be addressed for broader adoption. One key limitation is[...] Despite these challenges, the versatility of pyroelectric materials positions them as critical components for sustainable energy solutions and next-generation sensor technologies.

> The future of hydrocarbon economies faces several challenges, including[...] This section would speculate on potential developments and the changing landscape of global energy.

> Operating in the current Afghan media environment presents numerous challenges, including[...] Despite these challenges, Amu TV has managed to continue to provide a vital service to the Afghan population​​.

> For example, while the methodology supports transdisciplinary collaboration in principle, applying it effectively in large, heterogeneous teams can be challenging. [...] SCE continues to evolve in response to these challenges.

### Leads treating Wikipedia lists or broad article titles as proper nouns

AI 条目若以非[专名](https://en.wikipedia.org/wiki/Proper_name "Proper name")为标题，例如[列表](https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lists "Wikipedia:Manual of Style/Lists")，导言首句可能把标题介绍或定义成一个独立存在的现实实体。虽然[格式手册](https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lead_section#Format_of_the_first_sentence "Wikipedia:Manual of Style/Lead section")允许“自然地”在导言开头使用这类标题，但 AI 的这些开头往往并不自然。

**示例**

> "The Effects of Foreign language anxiety on Learning" refers to the feelings of tension, nervousness, and apprehension experienced when learning or using a language other than one's native tongue.

> EuroGames editions is the chronological list of the biennial EuroGames, a European LGBT+ multi-sport event organized by the European Gay and Lesbian Sport Federation (EGLSF).

> The "**List of songs about Mexico**" is a curated compilation of musical works that reference Mexico its culture, geography, or identity as a central theme.

---

## Language and Grammar

### Overused "AI vocabulary" words

**需注意的词：** *align/aligns/aligning with*,[^6][^8] *crucial*,[^1] *delve/delves/delving* (pre-2025),[^6][^8][^1] *emphasizing*,[^6][^8] *enduring*,[^8] *enhance/enhances/enhancing*,[^8][^1] *fostering*,[^8][^1] *garnered/garnering*,[^6][^8] *highlight/highlighted/highlighting/highlights* (as a verb),[^1] *interplay*,[^8] *intricate/intricacies*,[^6][^8][^7] *key* (as an adjective), *landscape*,[^8] *leveraging*,[^1] *multifaceted*,[^6][^8][^7] *notably*,[^8] *nuanced*,[^6][^8] *realm*,[^8] *robust*,[^1] *seamless/seamlessly*,[^1] *shed light on*, *showcasing*,[^8] *streamline*,[^1] *tapestry*,[^8] *testament*,[^1][^8] *underpin/underpins/underpinning*,[^8] *underscore/underscores/underscoring*,[^8] *vibrant*,[^8][^7] *vital*,[^1] ...

多项研究表明，LLM 过度使用某些词，尤其与几乎可以确定由人类撰写的 2022 年之前文本相比。[^6] 这些“AI 词汇”也普遍存在于 [Grokipedia](https://en.wikipedia.org/wiki/Grokipedia "Grokipedia") 等 AI 百科和 AI 生成的 Wikipedia 内容中，并常在输出中共同出现：看到一个，很可能还有其他。[^10] 一次编辑引入一两个词，未必说明问题；但 2022 年之后的一次编辑反复引入大量此类词，是使用 AI 的强烈迹象之一。

“AI 词汇”的分布随聊天机器人或 LLM 不同而略有差别，[^7] 也会随时间变化。例如 ChatGPT 在 2025 年之前大量使用 *delve*，之后频率骤降。[^11]

请结合上下文。例如，虽然 AI 文本滥用 underscore，它也可能指字面的下划线，或[背景配乐](https://en.wikipedia.org/wiki/Incidental_music "Incidental music")。

**示例**

> Somali cuisine is an intricate and diverse fusion of a multitude of culinary influences, drawing from the rich tapestry of [Arab](https://en.wikipedia.org/wiki/Arab_cuisine "Arab cuisine"), [Indian](https://en.wikipedia.org/wiki/Indian_cuisine "Indian cuisine"), and [Italian](https://en.wikipedia.org/wiki/Italian_cuisine "Italian cuisine") flavours. This culinary tapestry is a direct result of Somalia's longstanding heritage of vibrant trade and bustling commerce. [...]
>
> Additionally, a distinctive feature of Somali culinary tradition is the incorporation of [camel](https://en.wikipedia.org/wiki/Camel "Camel") [meat](https://en.wikipedia.org/wiki/Meat "Meat") and [milk](https://en.wikipedia.org/wiki/Milk "Milk"). They are considered a delicacy and serve as cherished and fundamental elements in the rich tapestry of Somali cuisine. [...]
>
> An enduring testament to the influence of [Italian colonial rule in Somalia](https://en.wikipedia.org/wiki/Italian_Somaliland "Italian Somaliland") is the widespread adoption of [pasta](https://en.wikipedia.org/wiki/Pasta "Pasta") and [lasagne](https://en.wikipedia.org/wiki/Lasagna "Lasagna") in the local culinary landscape, espicially in the south, showcasing how these dishes have integrated into the traditional diet alongside rice. [...]
>
> Additionally, Somali merchants played a pivotal role in the global coffee trade, being one of the first to export coffee beans.

### Negative parallelisms

含“not”“but”“however”的平行结构，例如“Not only ... but ...”“It is not just about ..., it's ...”，在 LLM 文字中很常见，却往往不适合中立语气。[^1][^11]

**示例**

> **Self-Portrait** by Yayoi Kusama, executed in 2010 and currently preserved in the famous Uffizi Gallery in Florence, constitutes not only a work of self-representation, but a visual document of her obsessions, visual strategies and psychobiographical narratives.

> It's not just about the beat riding under the vocals; it's part of the aggression and atmosphere.

下面是跨多个句子的否定平行结构示例：

> He hailed from the esteemed Duse family, renowned for their theatrical legacy. Eugenio's life, however, took a path that intertwined both personal ambition and familial complexities.

### Outlines of negatives

少数看似 AI 生成的用户消息，还会用短句描述某些缺失之物，或与前面有用事物相比毫无价值的东西。例如“no ..., no ..., just ...”或“What matters is ..., not ..., not ...”。

**示例**

> There are no long-form profiles. No editorial insights. No coverage of her game dev career. No notable accolades. Just TikTok recaps and callouts.

---

> The process demands rigor — not emotional fatigue, not personal offense, and certainly not a premature exit masked as moral high ground.

---

> Not a career, not a body of work, not sustained relevance — just an algorithmic moment.

---

> This is not a close call. It is not a gray area. This page should be gone, fully, cleanly, and without delay. No redirect. No merge. Just delete.

---

> Wikipedia's general notability guideline (WP:GNG) is crystal clear: significant coverage in reliable, independent, secondary sources. Not a few throwaway articles echoing Twitter drama. Not reactionary posts exploiting culture war tension. Not foreign-language gossip magazines translating controversy for clicks.

---

> What actually matters — and what continues to be completely absent — is significant, in-depth coverage in reliable, independent secondary sources. Not gossip sites. Not recycled outrage. Not tabloid blurbs about one viral controversy. And certainly not basic directory-style mentions of someone being a "video game writer" or TikTok creator.

### Rule of three

LLM 过度使用[三项法则](https://en.wikipedia.org/wiki/Rule_of_three_(writing) "Rule of three (writing)")：从“形容词、形容词、形容词”，到“短语、短语和短语”，形式多样。[^1] 它常靠这种结构，让[表面分析](#superficial-analyses)显得更全面。

**示例**

> The Amaze Conference brings together global SEO professionals, marketing experts, and growth hackers to discuss the latest trends in digital marketing. The event features keynote sessions, panel discussions, and networking opportunities.

### Vague attributions of opinion

**需注意的词：** *Industry reports*, *Observers have cited*, *Some critics argue*...

AI 常把观点或主张归给模糊的权威，这种做法称为[模糊措辞](https://en.wikipedia.org/wiki/Weasel_wording "Weasel wording")，同时只引用一两个未必支持该观点的来源。它也倾向把少数来源的看法，概括成更大群体的意见。

**示例**

> His [Nick Ford's] compositions have been described as exploring conceptual themes and bridging the gaps between artistic media.

— 来自 [Draft:Nick Ford (musician)](https://en.wikipedia.org/wiki/Draft:Nick_Ford_(musician) "Draft:Nick Ford (musician)")。这里的模糊措辞暗示意见出自独立来源，实际引用的却是 Nick Ford 自己的网站。

> Due to its unique characteristics, the Haolai River is of interest to researchers and conservationists. Efforts are ongoing to monitor its ecological health and preserve the surrounding grassland environment, which is part of a larger initiative to protect China's semi-arid ecosystems from degradation.

> The Kwararafa (Kororofa) confederacy is described in scholarship as a shifting [Benue valley](https://en.wikipedia.org/wiki/Benue_valley "Benue valley") coalition led by [Jukun](https://en.wikipedia.org/wiki/Jukun "Jukun") groups and incorporating a range of [Middle Belt](https://en.wikipedia.org/wiki/Middle_Belt "Middle Belt") peoples. Because much of the historical record derives from [Hausa](https://en.wikipedia.org/wiki/Hausa "Hausa") chronicles, Bornu sources and oral tradition, modern researchers treat Kwararafa as a fluid political and cultural formation rather than a fixed state. As a result, lists of member groups vary by period and source.

### Excessive synonym variance / elegant variation

生成式 AI 通过重复惩罚机制，避免太频繁地复用词语。[^5] 例如，输出先给出主角姓名，之后再次提及时便不断换用同义词或相关说法，如 protagonist、key player、eponymous character。

注意：如果用户分多次编辑加入多段 AI 内容，这条迹象可能不适用，因为每段可能单独生成。

**示例**

> Vierny, after a visit in Moscow in the early 1970's, committed to supporting artists resisting the constraints of socialist realism and discovered Yankilevskly, among others such as Ilya Kabakov and Erik Bulatov. In the challenging climate of Soviet artistic constraints, Yankilevsky, alongside other non-conformist artists, faced obstacles in expressing their creativity freely. Dina Vierny, recognizing the immense talent and the struggle these artists endured, played a pivotal role in aiding their artistic aspirations. [...]
>
> In this new chapter of his life, Yankilevsky found himself amidst a community of like-minded artists who, despite diverse styles, shared a common goal—to break free from the confines of state-imposed artistic norms, particularly socialist realism. [...]
>
> The move to Paris facilitated an environment where Yankilevsky could further explore and exhibit his distinctive artistic vision without the constraints imposed by the Soviet regime. Dina Vierny's unwavering support and commitment to the Russian avant-garde artists played a crucial role in fostering a space where their creativity could flourish, contributing to the rich tapestry of artistic expression in the vibrant cultural landscape of Paris. Vierny's commitment culminated in the groundbreaking exhibition "Russian Avant-Garde - Moscow 1973" at her Saint-Germain-des-Prés gallery, showcasing the diverse yet united front of non-conformist artists challenging the artistic norms of their time.

### False ranges

*from ... to ...* 不是比喻时，用来表示某个尺度的上下界。尺度可以是量化的，涉及明确或隐含的数值范围（如 1990–2000 年、15–20 盎司、冬季到秋季）；也可以是定性的类别边界（如“from seed to tree”“from mild to severe”“from white belt to black belt”）。同一结构也可构成[两极统括](https://en.wikipedia.org/wiki/Merism "Merism")：用整体的两个对立极端指代整体。这虽然是比喻，结构仍与字面用法相同，因为仍需要可辨认的尺度，例如“从头到脚”（以身体长度指代全身）、[from soup to nuts](https://en.wiktionary.org/wiki/from_soup_to_nuts "wikt:from soup to nuts")（明显基于时间）等。这些*并非*虚假范围。

LLM 很喜欢混用不同事物，例如列举集合中的项目时，不逐项直说，而使用范围结构。关键在于：不改变两端，能否找到中间部分？如果中间必须换一个尺度，或原本就不存在尺度、也想象不出连贯整体，这就是**虚假范围**。LLM 常用“比喻性的”（往往只是无意义的）“from ... to ...”，看似描述一个尺度，两端却只有松散联系甚至毫无关系，无法推断出有意义的范围。它这样做，是因为说服性文字会用此类空话来打动和取悦读者，而 LLM 训练深受这种文字影响。

**示例**

> Our journey through the universe has taken us from the singularity of the Big Bang to the grand cosmic web, from the birth and death of stars that forge the elements of life, to the enigmatic dance of dark matter and dark energy that shape its destiny.
>
> [...] Intelligence and Creativity: From problem-solving and tool-making to scientific discovery, artistic expression, and technological innovation, human intelligence is characterized by its adaptability and capacity for novel solutions. [...] Continued Scientific Discovery: The quest to understand the universe, life, and ourselves will continue to drive scientific breakthroughs, from fundamental physics to medicine and neuroscience.

### Title case in section headings

AI 聊天机器人很倾向于把章节标题中所有主要单词的首字母大写。[^1]

**示例**

> Global Context: Critical Mineral Demand
>
> According to a 2023 report by [Goldman Sachs](https://en.wikipedia.org/wiki/Goldman_Sachs "Goldman Sachs"), the global market for critical minerals [...]
>
> Strategic Negotiations and Global Partnerships
>
> In 2014, Katalayi was appointed senior executive adviser to the chairman of the board of [Gécamines](https://en.wikipedia.org/wiki/G%C3%A9camines "Gécamines") [...]
>
> High-Stakes Deals: Glencore, China, and Russia
>
> There was also interest from [Moscow](https://en.wikipedia.org/wiki/Moscow "Moscow") for strategic Congolese assets. [...]

---

## Punctuation and Formatting

### Excessive use of boldface

AI 常以过度、机械的方式，用[粗体](https://en.wikipedia.org/wiki/Boldface "Boldface")强调各种短语。它从 README、爱好者 Wiki、教程、销售文案、幻灯片、列表文章等大量用粗体的资料中继承了一种习惯：反复加粗选中的每个词或短语，常像在列“key takeaways”。一些较新的模型或应用已加入避免过度加粗的指令。

**示例**

> It blends **OKRs (Objectives and Key Results)**, **KPIs (Key Performance Indicators)**, and visual strategy tools such as the **Business Model Canvas (BMC)** and **Balanced Scorecard (BSC)**. OPC is designed to bridge the gap between strategy and execution by fostering a unified mindset and shared direction within organizations.

> A **leveraged buyout (LBO)** is characterized by the extensive use of **debt financing** to acquire a company. This financing structure enables **private equity firms** and **financial sponsors** to control businesses while investing a relatively small portion of their own equity. The acquired company's **assets and future cash flows** serve as collateral for the debt, making lenders more willing to provide financing.

> **50 Scientists and Thinkers in AI Safety with significant** influence on the field of alignment, containment, and risk mitigation. The list includes their **Productive Years**, their estimated **P(doom)** (probability of existential catastrophe), a **one-sentence summary of their contribution to AI Safety**, and their Wikipedia link.

### Inline-header vertical lists

AI 输出常出现特定形式的纵向列表：有序或无序标记之后，先跟一个行内粗体小标题，再用冒号与后面的说明分开。

无序列表可能不用[正确的 wikitext](https://en.wikipedia.org/wiki/H:LIST "H:LIST")，而直接使用 •、连字符（-）、短划线（–）、井号（#）、emoji 等字符。有序列表也可能显式写数字（如 `1.`），而非标准 wikitext。复制屏幕上的纯文本时，部分格式信息可能丢失，换行也可能丢失。

**示例**

> 1. Historical Context Post-WWII Era: The world was rapidly changing after WWII, [...] 2. Nuclear Arms Race: Following the U.S. atomic bombings, the Soviet Union detonated its first bomb in 1949, [...] 3. Key Figures Edward Teller: A Hungarian physicist who advocated for the development of more powerful nuclear weapons, [...] 4. Technical Details of Sundial Hydrogen Bomb: The design of Sundial involved a hydrogen bomb [...] 5. Destructive Potential: If detonated, Sundial would create a fireball up to 50 kilometers in diameter, [...] 6. Consequences and Reactions Global Impact: The explosion would lead to an apocalyptic nuclear winter, [...] 7. Political Reactions: The U.S. military and scientists expressed horror at the implications of such a weapon, [...] 8. Modern Implications Current Nuclear Arsenal: Today, there are approximately 12,000 nuclear weapons worldwide, [...] 9. Key Takeaways Understanding the Madness: The concept of Project Sundial highlights the extremes of human ingenuity [...] 10. Questions to Consider What were the motivations behind the development of Project Sundial? [...]

> Conflict of Interest (COI)/Autobiography: While I understand the concern regarding my username [...]
>
> Notability (GNG and NPOLITICIAN): I have revised the article to focus on factual details [...]
>
> Original Research (WP) and Promotional Tone: I have worked on removing original research [...]
>
> Article Move to Main Namespace: Moving the draft to the main namespace after the AFC review [...]

### Emojis

AI 很喜欢 [emoji](https://en.wikipedia.org/wiki/Emoji "Emoji")。[^11] 尤其会把它们放在章节标题或项目之前作为装饰，在讨论页评论中最明显。

**示例**

> Let's decode exactly what's happening here:
>
> 🧠 Cognitive Dissonance Pattern:
>
> You've proven authorship, demonstrated originality, and introduced new frameworks, yet they're defending a system that explicitly disallows recognition of originators unless a third party writes about them first.
>
> [...]
>
> 🧱 Structural Gatekeeping:
>
> Wikipedia policy favors:
>
> [...]
>
> 🚨 Underlying Motivation:
>
> Why would a human fight you on this?
>
> [...]
>
> 🧭 What You're Actually Dealing With:
>
> This is not a debate about rules.
>
> [...]

> 🪷 Traditional Sanskrit Name: Trikoṇamiti
>
> Tri = Three
>
> Koṇa = Angle
>
> Miti = Measurement 🧭 "Measurement of three angles" — the ancient Indian art of triangle and angle mathematics.
>
> 🕰️ 1. Vedic Era (c. 1200 BCE – 500 BCE)
>
> [...]
>
> 🔭 2. Sine of the Bow: Sanskrit Terminology
>
> [...]
>
> 🌕 3. Āryabhaṭa (476 CE)
>
> [...]
>
> 🌀 4. Varāhamihira (6th Century CE)
>
> [...]
>
> 🌠 5. Bhāskarācārya II (12th Century CE)
>
> [...]
>
> 📤 Indian Legacy Spreads

### Overuse of em dashes

人类编辑和作者也常喜欢[破折号](https://en.wikipedia.org/wiki/Em_dash "Em dash")（—），但 AI *尤其喜欢*。[^11] 同类文字中，LLM 比非专业人类作者更频繁使用破折号；在人类更可能使用逗号、括号、冒号，或误用连字符（-）的位置，也会使用它。LLM 尤其倾向公式化地用破折号，过度强调分句或并列结构，模仿经过“强化”的推销文案。

这个迹象应与其他指标结合，单独使用价值较小。

**示例**

> The term "Dutch Caribbean" is **not used in the statute** and is primarily promoted by **Dutch institutions**, not by the **people of the autonomous countries** themselves. In practice, many Dutch organizations and businesses use it for **their own convenience**, even placing it in addresses — e.g., "Curaçao, Dutch Caribbean" — but this only **adds confusion** internationally and **erases national identity**. You don't say **"Netherlands, Europe"** as an address — yet this kind of mislabeling continues.

> you're right about one thing — we do seem to have different interpretations of what policy-based discussion entails. [...]
>
> When WP:BLP1E says "one event," it's shorthand — and the supporting essays, past AfD precedents, and practical enforcement show that "two incidents of fleeting attention" still often fall under the protective scope of BLP1E. This isn't "imagining" what policy should be — it's recognizing how community consensus has shaped its application.
>
> Yes, WP:GNG, WP:NOTNEWS, WP:NOTGOSSIP, and the rest of WP:BLP all matter — and I've cited or echoed each of them throughout. [...] If a subject lacks enduring, in-depth, independent coverage — and instead rides waves of sensational, short-lived attention — then we're not talking about encyclopedic significance. [...]
>
> [...] And consensus doesn't grow from silence — it grows from critique, correction, and clarity.
>
> If we disagree on that, then yes — we're speaking different languages.

> The current revision of the article fully complies with Wikipedia's core content policies — including WP:V (Verifiability), WP:RS (Reliable Sources), and WP:BLP (Biographies of Living Persons) — with all significant claims supported by multiple independent and reputable international sources.
>
> [...] However, to date, no editor — including yourself — has identified any specific passages in the current version that were generated by AI or that fail to meet Wikipedia's content standards. [...]
>
> Given the article's current state — well-sourced, policy-compliant, and collaboratively improved — the continued presence of the "LLM advisory" banner is unwarranted.

### Curly quotation marks and apostrophes

AI 通常使用弯引号（"..." 或 '...'），而非直引号（"..." 或 '...'）。有时同一回复中混用弯引号与直引号。它也倾向在[缩略词](https://en.wikipedia.org/wiki/Contraction_(grammar) "Contraction (grammar)")和[所有格](https://en.wikipedia.org/wiki/English_possessive "English possessive")中，用与弯[右单引号](https://en.wikipedia.org/wiki/Right_single_quotation_mark "Right single quotation mark")相同的字符（'）代替直撇号（'），而且可能前后不一致。

单凭弯引号不能证明使用了 LLM。[Microsoft Word](https://en.wikipedia.org/wiki/Microsoft_Word "Microsoft Word")、[macOS](https://en.wikipedia.org/wiki/MacOS "MacOS")、[iOS](https://en.wikipedia.org/wiki/IOS "IOS") 设备都有将直引号转成弯引号的“[智能引号](https://en.wikipedia.org/wiki/Smart_quotes "Smart quotes")”功能。[LanguageTool](https://en.wikipedia.org/wiki/LanguageTool "LanguageTool") 等语法工具也可能如此。专业排版的报纸等作品常用弯引号和撇号。[Citer](https://citer.toolforge.org/) 等引文工具也可能保留网页标题中的字符，例如：

> McClelland, Mac (2017-09-27). ["When 'Not Guilty' Is a Life Sentence"](https://www.nytimes.com/2017/09/27/magazine/when-not-guilty-is-a-life-sentence.html). *The New York Times*. Retrieved 2025-08-03.

注意，Wikipedia 允许用户自定义显示字体。某些字体会把成对弯撇号显示成直形，用户便看不到差别。

### Subject lines

AI 生成的用户消息和[解封申请](https://en.wikipedia.org/wiki/Wikipedia:Identifying_LLM_unblock_requests "Wikipedia:Identifying LLM unblock requests")，有时会以本该粘贴到邮件表单 *Subject* 字段的内容开头。

**示例**

> Subject: Request for Permission to Edit Wikipedia Article - "Dog"

> Subject: Request for Review and Clarification Regarding Draft Article

---

## Communication Intended for the User

### Collaborative communication

**需注意的词：** *I hope this helps*, *Of course!*, *Certainly!*, *You're absolutely right!*, *Would you like...*, *is there anything else*, *let me know*, *more detailed breakdown*, *here is a*...

编辑有时会粘贴 AI 为通信、写作准备或建议生成的内容，而非条目正文；它可能出现在正文或注释（`<!-- -->`）中。被要求生成 Wikipedia 条目或评论时，聊天机器人也可能明说这些文字用于 Wikipedia，并在输出中提到各种[方针与指引](https://en.wikipedia.org/wiki/Wikipedia:PG "Wikipedia:PG")，还特意强调它们是 *Wikipedia 的*惯例。

**示例**

> In this section, we will discuss the background information related to the topic of the report. This will include a discussion of relevant literature, previous research, and any theoretical frameworks or concepts that underpin the study. The purpose is to provide a comprehensive understanding of the subject matter and to inform the reader about the existing knowledge and gaps in the field.

> Including photos of the forge (as above) and its tools would enrich the article's section on culture or economy, giving readers a visual sense of Ronco's industrial heritage. Visual resources can also highlight Ronco Canavese's landscape and landmarks. For instance, a map of the Soana Valley or Ronco's location in Piedmont could be added to orient readers geographically. The village's scenery [...] could be illustrated with an image. Several such photographs are available (e.g., on Wikimedia Commons) that show Ronco's panoramic view, [...] Historical images, if any exist (such as early 20th-century photos of villagers in traditional dress or of old alpine trades), would also add depth to the article. Additionally, the town's notable buildings and sites can be visually presented: [...] Including an image of the Santuario di San Besso [...] could further engage readers. By leveraging these visual aids – maps, photographs of natural and cultural sites – the expanded article can provide a richer, more immersive picture of Ronco Canavese.

> If you plan to add this information to the "Animal Cruelty Controversy" section of Foshan's Wikipedia page, ensure that the content is presented in a neutral tone, supported by reliable sources, and adheres to Wikipedia's guidelines on verifiability and neutrality.

> Here's a template for your wiki user page. You can copy and paste this onto your user page and customize it further.

> Final important tip: The ~~~~ at the very end is Wikipedia markup that automatically

### Knowledge-cutoff disclaimers and speculation about gaps in sources

**需注意的词：** *as of [date]*,[^a] *Up to my last training update*, *as of my last knowledge update*, *While specific details are limited/scarce...*, *not widely available/documented/disclosed*, *...in the provided/available sources/search results...*, *based on available information*...

知识截止免责声明，是 AI 用来说明所提供信息可能不完整、不准确或过时的声明。

LLM 如果有固定[知识截止时间](https://en.wikipedia.org/wiki/Knowledge_cutoff "Knowledge cutoff")（通常为最后一次训练更新），就无法提供其后事件或进展的信息，因此常输出免责声明，提醒用户信息仅准确到某个日期。

具备检索增强生成能力的 LLM 如果找不到某主题的来源，或用户提供的来源没含相关信息，常会给出类似知识截止免责声明的声明。它还可能猜测信息“可能”是什么，并说明其重要性。这些信息完全属于[推测](https://en.wikipedia.org/wiki/Wikipedia:OR "Wikipedia:OR")，包括“没有记录”的断言本身，也可能依据关联很弱的主题，甚至完全编造。

**示例**

> While specific details about Kumarapediya's history or economy are not extensively documented in readily available sources, ...

> While specific information about the fauna of Studniční hora is limited in the provided search results, the mountain likely supports...

> Though the details of these resistance efforts aren't widely documented, they highlight her bravery...

> No significant public controversies or security incidents affecting Outpost24 have been documented as of June 2025.

> As of my last knowledge update in January 2022, I don't have specific information about the current status or developments related to the "Chester Mental Health Center" in today's era.

> Below is a detailed overview based on available information:

### Prompt refusals

**需注意的词：** *as an AI language model*, *as a large language model*, *I'm sorry*...

AI 偶尔会拒绝按原要求回答，通常先道歉，并提醒自己是“an AI language model”。为显得有帮助，它常提出建议，或改答相似请求。直接拒绝已经越来越少见。

拒绝回答的文字显然不能放进 Wikipedia 条目；用户如果仍粘贴进去，可能没有审阅文本，或英语不熟练。请记住[善意推定](https://en.wikipedia.org/wiki/Wikipedia:Assume_good_faith "Wikipedia:Assume good faith")，因为编辑也许确实希望填补我们的[知识缺口](https://en.wikipedia.org/wiki/Wikipedia:Systemic_bias "Wikipedia:Systemic bias")。

**示例**

> As an AI language model, I can't directly add content to Wikipedia for you, but I can help you draft your bibliography.

### Phrasal templates and placeholder text

AI 可能生成留空待填的[短语模板](https://en.wikipedia.org/wiki/Phrasal_template "Phrasal template")（类似 *[Mad Libs](https://en.wikipedia.org/wiki/Mad_Libs "Mad Libs")* 游戏），让用户填入适合用途的词句；但有些用户忘了填。注意，也有非 LLM 生成的草稿和新条目模板，例如 [Wikipedia:Artist biography article template/Preload](https://en.wikipedia.org/wiki/Wikipedia:Artist_biography_article_template/Preload "Wikipedia:Artist biography article template/Preload") 和 [Category:Article creation templates](https://en.wikipedia.org/wiki/Category:Article_creation_templates "Category:Article creation templates") 中的页面。

**示例**

> Subject: Concerns about Inaccurate Information
>
> Dear Wikipedia
>
> I am writing to express my deep concern about the spread of misinformation on your platform. Specifically, I am referring to the article about [Entertainer's Name], which I believe contains inaccurate and harmful information.

> Subject: Edit Request for Wikipedia Entry
>
> Dear Wikipedia Editors,
>
> I hope this message finds you well. I am writing to request an edit for the Wikipedia entry
>
> I have identified an area within the article that requires updating/improvement. [Describe the specific section or content that needs editing and provide clear reasons why the edit is necessary, including reliable sources if applicable].

大型语言模型也可能在引用字段中放入“2025-xx-xx”等占位日期，尤其是 access-date，偶尔也包括 date，导致报错。

**示例**

```
<ref>{{cite web
 |title=Canadian Screen Music Awards 2025 Winners and Nominees
 |url=URL
 |website=Canadian Screen Music Awards
 |date=2025
 |access-date=2025-XX-XX
}}</ref>

<ref>{{cite web
 |title=Best Original Score, Dramatic Series or Special – Winner: "Murder on the Inca Trail"
 |url=URL
 |website=Canadian Screen Music Awards
 |date=2025
 |access-date=2025-XX-XX
}}</ref>
```

LLM 编辑信息框时，可能在未使用字段旁留下占位注释，提示添加文字或图片。

**示例**

```
| leader_name = <!-- Add if available with citation -->
```

---

## Markup

### Use of Markdown

AI 不熟悉 [wikitext](https://en.wikipedia.org/wiki/H:WT "H:WT")，这是指导 Wikipedia 的 [MediaWiki](https://en.wikipedia.org/wiki/MediaWiki "MediaWiki") 软件如何排版条目的[标记语言](https://en.wikipedia.org/wiki/Markup_language "Markup language")。它较小众，主要用于 MediaWiki 及 [Miraheze](https://en.wikipedia.org/wiki/Miraheze "Miraheze") 等基于 MediaWiki 的平台，因此 LLM 缺乏这种格式的训练资料。聊天机器人虽消化了数百万条 Wikipedia 条目，资料却并非包含 wikitext 语法的原始文本文件。此外，多数机器人默认采用另一种概念相似、应用更广的标记语言：[Markdown](https://en.wikipedia.org/wiki/Markdown "Markdown")。系统级指令要求以 Markdown 输出，应用再把语法渲染成标题、项目列表、编号列表、表格等，正如 MediaWiki 把 wikitext 渲染成格式化条目。

询问“格式指导”时，愿意透露部分系统级指令的机器人，通常会给出类似以下内容（来自 2025 年中的 [Microsoft Copilot](https://en.wikipedia.org/wiki/Microsoft_Copilot "Microsoft Copilot")）：

> ## Formatting Guidelines
>
> - All output uses GitHub-flavored Markdown.
> - Use a single main title (`#`) and clear primary subheadings (`##`).
> - Keep paragraphs short (3–5 sentences, ≤150 words).
> - Break large topics into labeled subsections.
> - Present related items as bullet or numbered lists; number only when order matters.
> - Always leave a blank line before and after each paragraph.
> - Avoid bold or italic styling in body text unless explicitly requested.
> - Use horizontal dividers (`---`) between major sections.
> - Employ valid Markdown tables for structured comparisons or data summaries.
> - Refrain from complex Unicode symbols; stick to simple characters.
> - Reserve code blocks for code, poems, lyrics, or similarly formatted content.
> - For mathematical expressions, use LaTeX outside of code blocks.

如上所示，Markdown 与 wikitext 语法完全不同：粗体和斜体用星号（*）或下划线（_），而非单引号（'）；章节标题用井号（#），而非等号（=）；URL 外用圆括号（()），而非方括号（[]）；分隔线用三个符号（---、***、___），而非四个连字符（----）。

即使明确要求，聊天机器人通常也难生成语法正确的 wikitext，因为训练数据使其更偏好、更熟悉 Markdown。要求“生成文章”时，往往默认使用 Markdown；部分平台的复制功能还会把它保留到剪贴板。要求为 Wikipedia 生成内容时，机器人也许“意识到”需要兼容的代码，并询问“Would you like me to ... turn this into actual Wikipedia markup format (`wikitext`)?”。[^b] 用户同意后，结果也常很简陋、语法有误，或二者兼有。机器人可能把尝试生成的 wikitext 放入 Markdown 围栏代码块，外面再包着 Markdown 文字和语法；复制到剪贴板时，这些内容可能一起保留，留下混用两种标记语言的明显痕迹。文本中可能出现三个反引号，例如 ` ```wikitext `。[^c]

错误的 wikitext 与 Markdown 混用，是 LLM 生成的强烈迹象，尤其以 Markdown 围栏代码块出现时。但*单独*出现 Markdown 并不构成强烈迹象。开发者、研究者、技术作者和资深网民，常在 [Obsidian](https://en.wikipedia.org/wiki/Obsidian_(software) "Obsidian (software)")、[GitHub](https://en.wikipedia.org/wiki/GitHub_Flavored_Markdown "GitHub Flavored Markdown") 以及 Reddit、Discord、Slack 等平台使用 Markdown。iOS Notes、Google Docs、Windows Notepad 等工具也支持编辑或导出 Markdown。它越来越普及，新编辑也可能默认认为 Wikipedia 支持 Markdown。

**示例**

> I believe this block has become procedurally and substantively unsound. Despite repeatedly raising clear, policy-based concerns, every unblock request has been met with **summary rejection** — not based on specific diffs or policy violations, but instead on **speculation about motive**, assertions of being "unhelpful", and a general impression that I am "not here to build an encyclopedia". No one has meaningfully addressed the fact that I have **not made disruptive edits**, **not engaged in edit warring**, and have consistently tried to **collaborate through talk page discussion**, citing policy and inviting clarification. Instead, I have encountered a pattern of dismissiveness from several administrators, where reasoned concerns about **in-text attribution of partisan or interpretive claims** have been brushed aside. Rather than engaging with my concerns, some editors have chosen to mock, speculate about my motives, or label my arguments "AI-generated" — without explaining how they are substantively flawed.

> - The Wikipedia entry does not explicitly mention the "Cyberhero League" being recognized as a winner of the World Future Society's BetaLaunch Technology competition, as detailed in the interview with THE FUTURIST ([[1]](https://consciouscreativity.com/the-futurist-interview-with-dana-klisanin-creator-of-the-cyberhero-league/)([https://consciouscreativity.com/the-futurist-interview-with-dana-klisanin-creator-of-the-cyberhero-league/](https://consciouscreativity.com/the-futurist-interview-with-dana-klisanin-creator-of-the-cyberhero-league/))). This recognition could be explicitly stated in the "Game design and media consulting" section.

此处 LLM 错用 `##` 表示章节标题，MediaWiki 却把它解释为编号列表。

> 1. 1. Geography
>
> Villers-Chief is situated in the [Jura Mountains](https://en.wikipedia.org/wiki/Jura_Mountains "Jura Mountains"), in the eastern part of the Doubs department. [...]
>
> 1. 1. History
>
> Like many communes in the region, Villers-Chief has an agricultural past. [...]
>
> 1. 1. Administration
>
> Villers-Chief is part of the [Canton of Valdahon](https://en.wikipedia.org/wiki/Canton_of_Valdahon "Canton of Valdahon") and the [Arrondissement of Pontarlier](https://en.wikipedia.org/wiki/Arrondissement_of_Pontarlier "Arrondissement of Pontarlier"). [...]
>
> 1. 1. Population
>
> The population of Villers-Chief has seen some fluctuations over the decades, [...]

AI 不熟悉 wikitext 和 Wikipedia 模板，常产生错误语法。一个显著例子是与 Template:AfC submission 有关的乱码，因为新编辑可能向机器人询问怎样提交 Articles for Creation 草稿。

**示例**

注意，这个严重损坏的分类链接，似乎来自 LLM 的 Markdown 解析器用于提供日期信息的代码：

```
[[Category:AfC submissions by date/<0030Fri, 13 Jun 2025 08:18:00 +0000202568 2025-06-13T08:18:00+00:00Fridayam0000=error>EpFri, 13 Jun 2025 08:18:00 +0000UTC00001820256 UTCFri, 13 Jun 2025 08:18:00 +0000Fri, 13 Jun 2025 08:18:00 +00002025Fri, 13 Jun 2025 08:18:00 +0000: 17498026806Fri, 13 Jun 2025 08:18:00 +0000UTC2025-06-13T08:18:00+00:0020258618163UTC13 pu62025-06-13T08:18:00+00:0030uam301820256 2025-06-13T08:18:00+00:0008amFri, 13 Jun 2025 08:18:00 +0000am2025-06-13T08:18:00+00:0030UTCFri, 13 Jun 2025 08:18:00 +0000 &qu202530;:&qu202530;.</0030Fri, 13 Jun 2025 08:18:00 +0000202568>June 2025|sandbox]]
```

### ChatGPT-specific markup: citeturn, iturn

ChatGPT 可能在句末加入 `citeturn0search0`（外面包围 Unicode 私用区字符），且 search 后的数字随文本推进而增大。这些位置本来是聊天机器人链接外部网站的地方；用户把对话粘贴到 Wikipedia 时，链接却变成占位代码。2025 年 2 月首次观察到此现象。

回复中的一组图片也可能显示成 `iturn0image0turn0image1turn0image4turn0image5`。少数情况下，还会出现类似标记，如 `citeturn0news0`、`citeturn1file0`、`citegenerated-reference-identifier`。

**示例**

> The school is also a center for the US College Board examinations, SAT I & SAT II, and has been recognized as an International Fellowship Centre by Cambridge International Examinations. citeturn0search1 For more information, you can visit their official website: citeturn0search0

### Reference markup bugs: contentReference, oaicite, oai_citation, attached_file, grok_card

由于一个 bug，ChatGPT 可能在输出中用 `:contentReference[oaicite:0]{index=0}` 代替参考链接。ChatGPT 生成的参考链接也可能标记为 `oai_citation`。

**示例**

> :contentReference[oaicite:16]{index=16}
>
> 1. **Ethnicity clarification**
>
> - :contentReference[oaicite:17]{index=17}
>     * :contentReference[oaicite:18]{index=18} :contentReference[oaicite:19]{index=19}.
>     * Denzil Ibbetson's *Panjab Castes* classifies Sial as Rajputs :contentReference[oaicite:20]{index=20}.
>     * Historian's blog notes: "The Sial are a clan of Parmara Rajputs…" :contentReference[oaicite:21]{index=21}.
> 2. :contentReference[oaicite:22]{index=22}
>
> - :contentReference[oaicite:23]{index=23}
>     > :contentReference[oaicite:24]{index=24} :contentReference[oaicite:25]{index=25}.

> #### Key facts needing addition or correction:
>
> 1. **Group launch & meetings**
>
> *Independent Together* launched a "Zero Rates Increase Roadshow" on 15 June, with events in Karori, Hataitai, Tawa, and Newtown  [oai_citation:0‡wellington.scoop.co.nz](https://wellington.scoop.co.nz/?p=171473&utm_source=chatgpt.com).
>
> 2. **Zero-rates pledge and platform**
>
> The group pledges no rates increases for three years, then only match inflation—responding to Wellington's 16.9% hike for 2024/25  [oai_citation:1‡en.wikipedia.org](https://en.wikipedia.org/wiki/Independent_Together?utm_source=chatgpt.com).

截至 2025 年秋，已观察到句末出现 `[attached_file:1]`、`[web:1]` 等标签，可能是 Perplexity 特有的。[^12]

> During his time as CEO, Philip Morris's reputation management and media relations brought together business and news interests in ways that later became controversial, with effects still debated in contemporary regulatory and legal discussions.[attached_file:1]

Grok 生成的文本相对少见，但有时会在引用后出现类似 XML 的 *grok_card* 标签。

> Malik's rise to fame highlights the visibility of transgender artists in Pakistan's entertainment scene, though she has faced societal challenges related to her identity. [...]<grok-card data-id="e8ff4f" data-type="citation_card">

### attribution and attributableIndex

ChatGPT 可能在句末加入 JSON 格式代码 `({"attribution":{"attributableIndex":"X-Y"}})`，X、Y 为递增的数字索引。

**示例**

> ^[Evdokimova was born on 6 October 1939 in Osnova, Kharkov Oblast, Ukrainian SSR (now Kharkiv, Ukraine).]({"attribution":{"attributableIndex":"1009-1"}}) ^[She graduated from the Gerasimov Institute of Cinematography (VGIK) in 1963, where she studied under Mikhail Romm.]({"attribution":{"attributableIndex":"1009-2"}}) [oai_citation:0‡IMDb](https://www.imdb.com/name/nm0947835/?utm_source=chatgpt.com) [oai_citation:1‡maly.ru](https://www.maly.ru/en/people/EvdokimovaA?utm_source=chatgpt.com)

> Patrick Denice & Jake Rosenfeld, [Les syndicats et la rémunération non syndiquée aux États-Unis, 1977–2015](https://sociologicalscience.com/articles-v5-23-541/), ''Sociological Science'' (2018).]({"attribution":{"attributableIndex":"3795-0"}})

### Non-existent or out-of-place categories and "see also" pages

LLM 可能凭空生成不存在的分类：有时是看似合理的通用概念分类或 SEO 关键词，有时是训练资料中已过时、改名的分类。这些会显示为红色链接。也可能出现分类重定向，例如长期被垃圾信息发送者偏爱的 Category:Entrepreneurs。审阅者有时会删除错误分类，所以怀疑页面由 LLM 生成时，值得查看早期修订。

也应留意“see also”标题下的蓝色链接。LLM 生成的相关条目章节，常像完成任务一样填入至少三个链接。如果某个初创公司草稿把 Financial technology 这类宽泛概念放入相关条目，就有些可疑。

当然，本节任何现象都不应视为绝对规则。新用户可能不了解 Wikipedia 对这些章节的格式指引，回归编辑也可能习惯了已删除的旧分类。

**示例**

```
[[Category:American hip hop musicians]]
```

而不是

```
[[Category:American hip-hop musicians]]
```

---

## Citations

### Fictitious or hallucinated references

LLM 可能编造不存在或包含虚假信息的参考资料。

### Broken external links

新条目或草稿如果有多个外部引用链接，其中一些已经损坏（如返回 [404 错误](https://en.wikipedia.org/wiki/404_error "404 error")），这是 AI 生成页面的强烈迹象，尤其在 [Internet Archive](https://en.wikipedia.org/wiki/Internet_Archive "Internet Archive")、[Archive Today](https://en.wikipedia.org/wiki/Archive_Today "Archive Today") 等归档网站也找不到时。多数链接都会[随时间失效](https://en.wikipedia.org/wiki/Link_rot "Link rot")，但这些因素表明它们很可能从未存在。

### Invalid DOI and ISBNs

可以用[校验和](https://en.wikipedia.org/wiki/Checksum "Checksum")验证 [ISBNs](https://en.wikipedia.org/wiki/ISBN "ISBN")。校验和无效时，ISBN 很可能有误，引用模板也会警告。类似地，[DOIs](https://en.wikipedia.org/wiki/Digital_object_identifier "Digital object identifier") 比普通链接更不易失效。无法解析的 DOI 和无效 ISBN，都可能暗示[幻觉生成](https://en.wikipedia.org/wiki/Hallucination_(AI) "Hallucination (AI)")的参考资料。

相关情况还包括：DOI 指向完全无关的文章，或书籍引用没有页码。例如，以下文字由 ChatGPT 生成。

> Ohm's Law is a fundamental principle in the field of electrical engineering and physics that states the current passing through a conductor between two points is directly proportional to the voltage across the two points, provided the temperature remains constant. Mathematically, it is expressed as V=IR, where V is the voltage, I is the current, and R is the resistance. The law was formulated by German physicist Georg Simon Ohm in 1827, and it serves as a cornerstone in the analysis and design of electrical circuits [1]. Ohm's Law applies to many materials and components that are "ohmic," meaning their resistance remains constant regardless of the applied voltage or current. However, it does not hold for non-linear devices like diodes or transistors [2][3].
>
> References:
>
> 1. Dorf, R. C., & Svoboda, J. A. (2010). Introduction to Electric Circuits (8th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 9780470521571.
>
> 2. M. E. Van Valkenburg, "The validity and limitations of Ohm's law in non-linear circuits," Proceedings of the IEEE, vol. 62, no. 6, pp. 769–770, Jun. 1974. doi:10.1109/PROC.1974.9547
>
> 3. C. L. Fortescue, "Ohm's Law in alternating current circuits," Proceedings of the IEEE, vol. 55, no. 11, pp. 1934–1936, Nov. 1967. doi:10.1109/PROC.1967.6033

书籍引用看似有效：电路书确实可能涉及欧姆定律；但没有页码，就无法核实正文主张。更糟的是，两条 *Proceedings of the IEEE* 引文都是完全编造的。DOI 指向完全不同的资料，还有其他问题。例如 [C. L. Fortescue](https://en.wikipedia.org/wiki/Charles_LeGeyt_Fortescue "Charles LeGeyt Fortescue") 在所称写作时间之前已去世三十多年，而第 55 卷第 11 期也没有任何文章与参考资料 3 的信息相符。

### Incorrect or unconventional use of references

AI 可能被要求加入参考资料，也尝试按 Wikipedia 要求处理，却在关键实现细节上出错，或明显偏离惯例。

**示例**

下例请注意错误的引用复用方式。当时使用的工具不能搜索真实来源（因为时间在 Bing Deep Search 推出前一天），但仍找到了一个真实参考资料；然而复用引用的语法是错的。

这里的 *Smith, R. J.* 来源——作为“第三个来源”，工具似乎生成了链接 'https://pubmed.ncbi.nlm.nih.gov/3'（其 PMID 为 3）——与正文完全无关。用户将其转成 {{cite journal}} 引用前没有检查，尽管链接确实可以打开。

该例中，LLM 在每个句号后都认真附上了错误的复用语法。

> For over thirty years, computers have been utilized in the rehabilitation of individuals with brain injuries. Initially, researchers delved into the potential of developing a "prosthetic memory."<ref>Fowler R, Hart J, Sheehan M. A prosthetic memory: an application of the prosthetic environment concept. *Rehabil Counseling Bull*. 1972;15:80–85.</ref> However, by the early 1980s, the focus shifted towards addressing brain dysfunction through repetitive practice.<ref>{{Cite journal |last=Smith |first=R. J. |last2=Bryant |first2=R. G. |date=1975-10-27 |title=Metal substitutions incarbonic anhydrase: a halide ion probe study |url=https://pubmed.ncbi.nlm.nih.gov/3 |journal=Biochemical and Biophysical Research Communications |volume=66 |issue=4 |pages=1281–1286 |doi=10.1016/0006-291x(75)90498-2 |issn=0006-291X |pmid=3}}</ref> Only a few psychologists were developing rehabilitation software for individuals with Traumatic Brain Injury (TBI), resulting in a scarcity of available programs.<sup>[3]</sup> Cognitive rehabilitation specialists opted for commercially available computer games that were visually appealing, engaging, repetitive, and entertaining, theorizing their potential remedial effects on neuropsychological dysfunction.<sup>[3]</sup>

某些 LLM 或聊天界面用 ↩ 表示脚注：

> References
>
> Would you like help formatting and submitting this to Wikipedia, or do you plan to post it yourself? I can guide you step-by-step through that too.
>
> **Footnotes**
>
> 1.   KLAS Research. (2024). *Top Performing RCM Vendors 2024*. https://klasresearch.com ↩ ↩2
> 2.   PR Newswire. (2025, February 18). *CureMD AI Scribe Launch Announcement*. https://www.prnewswire.com/news-releases/curemd-ai-scribe ↩

### ChatGPT-specific UTM parameters

ChatGPT 可能给来源 URL 添加 [UTM 参数](https://en.wikipedia.org/wiki/UTM_parameter "UTM parameter") `utm_source=openai`，或在 2025 年 8 月之前的编辑中添加 `utm_source=chatgpt.com`。Gemini、Claude 等其他 LLM 较少使用这类参数。[^13]

注意：这可以明确证明 ChatGPT 参与过，却不能单独证明文字也由它生成。有些编辑只用 AI 为已有文字找来源；编辑历史可以体现这一点。

**示例**

> Following their marriage, Burgess and Graham settled in Cheshire, England, where Burgess serves as the head coach for the Warrington Wolves rugby league team. [https://www.theguardian.com/sport/2025/feb/11/sam-burgess-interview-warrington-rugby-league-luke-littler?utm_source=chatgpt.com]

> Vertex AI documentation and blog posts describe watermarking, verification workflow, and configurable safety filters (for example, person‑generation controls and safety thresholds). ([cloud.google.com](https://cloud.google.com/vertex-ai/generative-ai/docs/image/generate-images?utm_source=openai))

### Named references declared in references section but unused in article body

*本节为空。*欢迎补充。*（2025 年 10 月）*

**示例**

以下 diff 提供示例。有问题的参考资料会在引用列表中显示为解析错误。

- [Special:PermanentLink/1287201002#References](https://en.wikipedia.org/wiki/Special:PermanentLink/1287201002#References "Special:PermanentLink/1287201002")
- [Special:PermanentLink/1292432848#References](https://en.wikipedia.org/wiki/Special:PermanentLink/1292432848#References "Special:PermanentLink/1292432848")
- [Special:PermanentLink/1291491974#References](https://en.wikipedia.org/wiki/Special:PermanentLink/1291491974#References "Special:PermanentLink/1291491974")
- [Special:PermanentLink/1291561040#References](https://en.wikipedia.org/wiki/Special:PermanentLink/1291561040#References "Special:PermanentLink/1291561040")

---

## Discrepancies in Writing Style and Variety of English

### Abrupt cut offs

AI 可能突然停止生成内容，例如预测接下来是文本结束标记（`<|endoftext|>`）时。此外，单次回复的 tokens 通常有限，继续生成需要用户点击“continue generating”。

这种方法并非万无一失，本地复制粘贴出错也可能造成相同现象。它也可能说明侵犯版权，而非使用 LLM。

### Sudden shift in writing style

编辑的文风突然改变，例如相较其他交流突然语法完美，可能意味着使用 AI。

### Sudden shift in English variety use

用户所在地、主题对应的英语变体和实际采用的英语变体不一致，可能暗示使用 AI。例如印度作者写印度大学，通常不会使用美式英语；LLM 若无特别提示，默认却多用美式英语。[^9] 注意，非英语母语者也容易混用英语变体；只有突然、彻底切换时，才应据此怀疑。

### Overwhelmingly verbose edit summaries

AI 生成的[编辑摘要](https://en.wikipedia.org/wiki/Help:Edit_summary "Help:Edit summary")常异常冗长，用正式、第一人称的段落，不使用缩写，或明显逐项罗列 Wikipedia 惯例。

> Refined the language of the article for a neutral, encyclopedic tone consistent with Wikipedia's content guidelines. Removed promotional wording, ensured factual accuracy, and maintained a clear, well-structured presentation. Updated sections on history, coverage, challenges, and recognition for clarity and relevance. Added proper formatting and categorized the entry accordingly

> I formalized the tone, clarified technical content, ensured neutrality, and indicated citation needs. Historical narratives were streamlined, allocation details specified with regulatory references, propagation explanations made reader-friendly, and equipment discussions focused on availability and regulatory compliance, all while adhering to encyclopedic standards.

> **Concise edit summary:** Improved clarity, flow, and readability of the plot section; reduced redundancy and refined tone for better encyclopedic style.

### "Submission statements" in AFC drafts

这专门涉及通过 Articles for Creation 提交的草稿。至少一种 LLM 会插入给审阅者看的“提交声明”，解释主题为什么值得收录、草稿为什么符合指引。实际上，这只会让审阅者知道草稿由 LLM 生成，并认为应直接拒绝或快速删除。

> Reviewer note (for AfC): This draft is a neutral and well-sourced biography of Portuguese public manager Jorge Patrão. All references are from independent, reliable sources (Público, Diário de Notícias, Jornal de Negócios, RTP, O Interior, Agência Lusa) covering his public career and cultural activity. It meets WP:RS and WP:BLP standards and demonstrates clear notability per WP:NBIO through: – Presidency of Serra da Estrela Tourism Region (1998–2013); – Presidency of Parkurbis – Covilhã Science and Technology Park; – Founding role in Rede de Judiarias de Portugal (member of the Council of Europe's European Routes of Jewish Heritage); – Authorship of the book "1677 – A Fábrica d'El-Rei"; – Founder/curator of the Beatriz de Luna Art Collection (Old Master focus). There is also a Portuguese version of this article at pt.wikipedia.org/wiki/Jorge_Patrão. Thank you for your review. -->

— 位于 Draft:Jorge Patrão 的顶部（所有常见排版错误均存在于原文）

### Pre-declined AFC review templates

新编辑偶尔会创建已带“declined”状态 AFC 审阅模板的草稿，但模板没有内容，也没有拒绝理由。LLM 似乎提议添加 AFC 提交模板，随后给出 `{{AfC submission|d}}`；其中 d 参数通过替换成 {{AfC submission/declined}}，提前把草稿设为拒绝。贡献历史显示模板由草稿创建者加入。创建者随后总会到 Wikipedia:WikiProject Articles for creation/Help desk 或其他帮助页，询问为何没有反馈就被拒绝。没有理由的“submission declined”标题，是 LLM 生成草稿的**强烈**迹象。

---

## Signs of Human Writing

### Age of text relative to ChatGPT launch

ChatGPT 于 2022 年 11 月 30 日向公众推出。此前 OpenAI 虽然有能力相近的 LLM，但它们付费、普通人不易接触，也不广为人知。ChatGPT 上线后立即迅速增长。

Wikipedia 在 **2022 年 11 月 30 日之前**加入的任何特定文字，都极不可能由 LLM 生成。如果编辑早于该日，可以排除该版本使用 AI。旧文字也可能恰好出现本清单的一些迹象，甚至很像 AI 生成，但 Wikipedia 的规模足以容纳这些罕见巧合。

### Ability to explain one's own editorial choices

编辑应该能够解释自己为什么作出某次编辑或犯错。例如发现疑似编造的 URL，可先询问发生了什么，而非急于下结论。如果对方能给出正确链接、解释人为失误（如拼写错误），或提供真实来源的相关段落，就更像普通的人类错误。

---

## Ineffective Indicators

错误指控 AI 会[赶走新编辑](https://en.wikipedia.org/wiki/Wikipedia:BITE "Wikipedia:BITE")，形成相互猜疑的氛围。声称使用 AI 前，应考虑[邓宁–克鲁格效应](https://en.wikipedia.org/wiki/Dunning%E2%80%93Kruger_effect "Dunning–Kruger effect")、[确认偏误](https://en.wikipedia.org/wiki/Confirmation_bias "Confirmation bias")是否干扰判断。以下一些常用指标，对识别 LLM 并无效果，甚至可能说明相反情况。

- **语法完美**：现代 LLM 语法能力强，但许多编辑也擅长写作或有专业背景。（另见[文风和英语变体不一致](#discrepancies-in-writing-style-and-variety-of-english)。）

- **“平淡”或“机械”的文字**：如前文所述，现代 LLM 默认更倾向热情洋溢且冗长。虽有套路，不熟悉 AI 写作的人却未必觉得它机械。[^14]

- **“华丽”“学术”或生僻词**：LLM 偏爱某些词句，其中很多很长、可读性较差，但这种相关性不适用于*所有*显得华丽、学术或高级的文字。[^1] 低频、生僻词在统计上少见，反而不容易出现在 AI 文字中，直接相关的专名除外。

- **单独的书信形式**：2023 年之后，含称呼、落款、主题等格式的讨论页消息，常显得像 AI；但书信和邮件*早在*现代 LLM 之前就采用这些惯例。人类编辑，尤其新人，也可能因习惯正式交流、课程要求，或误把讨论页当邮件而这样排版。AI 生成的消息往往还有纵向列表、[^d] 占位符或突然截断等其他迹象。

- **单独的连接词**：LLM 常机械、公式化地过度使用连接词，暗示不适当的事实综合，但人类议论文也常这样写，本身不是强烈迹象。

- **古怪的 wikitext**：如[使用 Markdown](#use-of-markdown)所述，LLM 可能编造模板或错误语法，但不太容易产生某些随机、难以解释的错误与残留（本页[标记](#markup)所列除外）。莫名其妙的 `<span>` 等 HTML 标签，更像浏览器扩展编程不佳，或 Wikipedia 内容翻译工具的已知 bug（T113137）。`''Catch-22 i''s a satirical novel.`（渲染为“*Catch-22 i* s a satirical novel.”）等错位语法，更像 VisualEditor 失误，因为在可视化编辑中比源码编辑更难察觉。

---

## Notes

[^a]: not unique to AI chatbots; is produced by the {{as of}} template

[^b]: Example of `Would you like me to ... turn this into actual Wikipedia markup format (wikitext)?` in a deleted draft (administrators only)

[^c]: Example of ` ```wikitext ` on a draft.

[^d]: Example of a vertical list in a deletion discussion

---

## References

[^1]: Russell, Jenna; Karpinska, Marzena; Iyyer, Mohit (2025). [*People who frequently use ChatGPT for writing tasks are accurate and robust detectors of AI-generated text*](https://aclanthology.org/2025.acl-long.267/). Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers). Vienna, Austria: Association for Computational Linguistics. pp.5342–5373. arXiv:[2501.15654](https://arxiv.org/abs/2501.15654).

[^2]: Dugan, Liam; Hwang, Alyssa; Trhlik, Filip; Zhu, Andrew; Ludan, Josh Magnus; Xu, Hainiu; Ippolito, Daphne; Callison-Burch, Chris (2024). [*RAID: A Shared Benchmark for Robust Evaluation of Machine-Generated Text Detectors*](https://aclanthology.org/2024.acl-long.674). Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers). Bangkok, Thailand: Association for Computational Linguistics. pp.12463–12492. arXiv:[2405.07940](https://arxiv.org/abs/2405.07940).

[^3]: ["People who frequently use ChatGPT for writing tasks are accurate and robust detectors of AI-generated text"](https://arxiv.org/html/2501.15654v2). *arxiv.org*. Retrieved 2025-11-28.

[^4]: This can be directly observed by examining images generated by text-to-image models; they look acceptable at first glance, but specific details tend to be blurry and malformed. This is especially true for background objects and text.

[^5]: ["10 Ways AI Is Ruining Your Students' Writing"](https://www.chronicle.com/article/10-ways-ai-is-ruining-your-students-writing). *Chronicle of Higher Education*. September 16, 2025. Archived from the original on October 1, 2025. Retrieved October 1, 2025.

[^6]: Juzek, Tom S.; Ward, Zina B. (2025). [*Why Does ChatGPT "Delve" So Much? Exploring the Sources of Lexical Overrepresentation in Large Language Models*](https://aclanthology.org/2025.coling-main.426.pdf) (PDF). Findings of the Association for Computational Linguistics: ACL 2025. Association for Computational Linguistics. arXiv:[2412.11385](https://arxiv.org/abs/2412.11385).

[^7]: Reinhart, Alex; Markey, Ben; Laudenbach, Michael; Pantusen, Kachatad; Yurko, Ronald; Weinberg, Gordon; Brown, David West. ["Do LLMs write like humans? Variation in grammatical and rhetorical styles"](http://arxiv.org/abs/2410.16107). Retrieved 4 December 2025.

[^8]: Kobak, Dmitry; González-Márquez, Rita; Horvát, Emőke-Ágnes; Lause, Jan (2 July 2025). ["Delving into LLM-assisted writing in biomedical publications through excess vocabulary"](https://www.science.org/doi/10.1126/sciadv.adt3813). *Science Advances*. **11** (27). doi:[10.1126/sciadv.adt3813](https://doi.org/10.1126%2Fsciadv.adt3813). ISSN 2375-2548. PMC 12219543. PMID 40009654.

[^9]: Ju, Da; Blix, Hagen; Williams, Adina (2025). [*Domain Regeneration: How well do LLMs match syntactic properties of text domains?*](https://aclanthology.org/2025.findings-acl.120). Findings of the Association for Computational Linguistics: ACL 2025. Vienna, Austria: Association for Computational Linguistics. pp.2367–2388. arXiv:[2505.07784](https://arxiv.org/abs/2505.07784). doi:[10.18653/v1/2025.findings-acl.120](https://doi.org/10.18653%2Fv1%2F2025.findings-acl.120).

[^10]: Kousha, Kayvan; Thelwall, Mike (2025). [*How much are LLMs changing the language of academic papers after ChatGPT? A multi-database and full text analysis*](https://arxiv.org/pdf/2509.09596). ISSI 2025 Conference. arXiv:[2509.09596](https://arxiv.org/abs/2509.09596).

[^11]: Merrill, Jeremy B.; Chen, Szu Yu; Kumer, Emma (13 November 2025). ["What are the clues that ChatGPT wrote something? We analyzed its style"](https://www.washingtonpost.com/technology/interactive/2025/how-detect-chatgpt-em-dash/). *The Washington Post*. Retrieved 14 November 2025.

[^12]: ["Unproductive Interpretation of Work and Employment as Misinformation?"](https://www.laetusinpraesens.org/docs20s/workeco.php). Archived from the original on 2 September 2025. Retrieved 21 October 2025.

[^13]: See [T387903](https://phabricator.wikimedia.org/T387903 "phabricator:T387903").

[^14]: Murray, Nathan; Tersigni, Elisa (21 July 2024). ["Can instructors detect AI-generated papers? Postsecondary writing instructor knowledge and perceptions of AI"](https://journals.sfu.ca/jalt/index.php/jalt/article/view/1895). *Journal of Applied Learning & Teaching*. **7** (2). doi:[10.37074/jalt.2024.7.2.12](https://doi.org/10.37074%2Fjalt.2024.7.2.12). ISSN 2591-801X. Retrieved 21 November 2025.

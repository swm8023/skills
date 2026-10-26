# Signs of AI Writing

[![ChatGPT 截图，内容为：“[header] Legacy & Interpretation [body] ‘Black Hole Edition’ 不仅是一个 meme，还是对草根汽车文化的庆祝；在这里，想法没有边界，乐趣比规格表更重要。无论动力来自 rotary engine、换装的 V8，还是想象中的 fighter jet turbine，Miata 始终是全球汽车爱好者挥洒创意的画布。”](https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/ChatGPT_response_screenshot_1.jpg/250px-ChatGPT_response_screenshot_1.jpg)](https://en.wikipedia.org/wiki/File:ChatGPT_response_screenshot_1.jpg)

*LLM 的写作风格往往可以辨认。*

本页列出 [AI 聊天机器人](https://en.wikipedia.org/wiki/AI_chatbot "AI chatbot")（例如 [ChatGPT](https://en.wikipedia.org/wiki/ChatGPT "ChatGPT")）常见的写作和排版习惯，并引用 Wikipedia 条目和草稿中的真实示例。这是一份帮助识别 Wikipedia 上[未披露的 AI 生成内容](https://en.wikipedia.org/wiki/Wikipedia:LLMDISCLOSE "Wikipedia:LLMDISCLOSE")的[实用指南](https://en.wikipedia.org/wiki/Field_guide "Field guide")。本清单属于*描述*，而非*规定*；它记录观察结果，并不制定规则。Wikipedia 条目应避免哪些语言和格式，可查阅[方针与指引](https://en.wikipedia.org/wiki/Wikipedia:PAG "Wikipedia:PAG")以及[格式手册](https://en.wikipedia.org/wiki/Wikipedia:MOS "Wikipedia:MOS")，这些规范不属于本页内容。

本清单*并非*禁止某些词、短语或punctuation。出现这些迹象的文本，不一定由 AI 生成，因为驱动聊天机器人的[large language model](https://en.wikipedia.org/wiki/Large_language_model "Large language model")接受了人类文字的训练，其中也包括 Wikipedia 编辑的文字。这只是对数千例 AI 文本中常见模式的汇总，*专门针对 Wikipedia*。有些建议适用于更广泛场景，但部分迹象，尤其punctuation和排版相关迹象，未必适用于 Wikipedia 以外的环境。

这里的模式也只是问题的潜在*迹象*，而非*问题本身*。过度加粗、用词与punctuation不佳、标记损坏、引用格式古怪等表面问题明显且容易修复，却可能暗示[更严重的方针风险](https://en.wikipedia.org/wiki/Wikipedia:AIFAIL "Wikipedia:AIFAIL")。LLM 文本如果从一开始或经后期润色足够精致，可能没有表面缺陷，却仍存在深层问题。不要只修补这些迹象，否则只会让识别更困难。真正需要处理的是深层问题；请自行解决，或依照 [Wikipedia:Large language models §Handling suspected LLM-generated content](https://en.wikipedia.org/wiki/Wikipedia:Large_language_models#Handling_suspected_LLM-generated_content "Wikipedia:Large language models") 和 [Wikipedia:WikiProject AI Cleanup/Guide](https://en.wikipedia.org/wiki/Wikipedia:WikiProject_AI_Cleanup/Guide "Wikipedia:WikiProject AI Cleanup/Guide") 的建议标记出来。

[快速删除方针](https://en.wikipedia.org/wiki/Wikipedia:Speedy_deletion "Wikipedia:Speedy deletion")中的 [G15](https://en.wikipedia.org/wiki/Wikipedia:G15 "Wikipedia:G15") 标准（未经人类审阅的 LLM 生成页面），只适用于最客观、最无争议的生成迹象，共有三种：第一种见[面向用户的沟通](#communication-intended-for-the-user)，其余两种见[引用](#citations)。

不要只依赖 [artificial intelligence content detection](https://en.wikipedia.org/wiki/Artificial_intelligence_content_detection "Artificial intelligence content detection") tools（如 [GPTZero](https://en.wikipedia.org/wiki/GPTZero "GPTZero")）判断文本是否由 LLM 生成。虽然它们的表现优于随机猜测，但 error rates 不低，不能代替 human judgment。[^1] 文本修改（如 paraphrasing、空格变化），以及使用 detectors 训练时没见过的 generative models 等因素，都可能使 detectors 失效。[^2] 同样，也不要过分相信自己的解读。研究表明，经常亲自使用 LLM 的人，判断文章是否由 AI 生成的准确率约为 90%；也就是说，即使你是 LLM 专家用户，标记 10 个 AI 页面时，大概也已误指控了一位编辑。[^3] 不常亲自使用 LLM 的人，在识别 AI 文章的两个方向上，都只略优于随机猜测。[^3]

---

## Regression to the Mean

LLM（以及一般的 [artificial neural networks](https://en.wikipedia.org/wiki/Artificial_neural_network "Artificial neural network")）根据大量 training material，使用 statistical algorithms 猜测、推断接下来应该出现什么。因此，它倾向 [regress to the mean](https://en.wikipedia.org/wiki/Regression_to_the_mean "Regression to the mean")；也就是说，结果趋向统计上最可能、适用情形最广的结果。这既可能是优势，也可能同时成为识别 AI-generated content 的线索。

例如，LLM 常用互联网资料训练，名人通常被描述得正面而重要。因此模型往往省略具体、独特、细腻的事实（统计上少见），替换成笼统的正面描述（统计上常见）。具体的“首个列车连接装置的发明者”，可能变成“引领变革的工业巨擘”。就像不断高声宣称肖像中的人独一无二、举足轻重，画像本身却从清晰照片变成模糊而普通的素描：内容越来越不具体，语气却越来越夸张。[^4]

这种regress to the mean，将具体事实磨平成可适用于许多主题的概括，也让 AI 内容更容易辨认。

### Undue emphasis on symbolism, legacy, and importance

**需注意的词：** *stands/serves as*, *is a testament/reminder*, *plays a vital/significant/crucial/pivotal role*, *underscores/highlights its importance/significance*, *reflects broader*, *symbolizing its ongoing/enduring/lasting impact*, *key turning point*, *indelible mark*, *deeply rooted*, *profound heritage*, *steadfast dedication*...

LLM 常添加陈述，声称主题的任意方面如何代表或贡献于更宏大的话题，以此夸大主题的重要性。[^5] 这类陈述有一套独特、容易辨认的写法。[^6]

> Statistical Institute of Catalonia 于 1989 年正式成立，标志着 Spain 地区统计发展中的一个 关键时刻（pivotal moment）。[...]
>
> Idescat 的成立，代表着向地区统计独立迈出的 重大转变（significant shift），使 [Catalonia](https://en.wikipedia.org/wiki/Catalonia "Catalonia") 能建立适合其独特社会经济背景的统计系统。这项举措属于 Spain 更广泛的运动，旨在分散行政职能，并 改善（enhance） 地区治理。

> Kumba 长期以来一直是重要的贸易和农业中心。[...] 连接 Kumba 与 Southwest Region 其他地区（如 Mamfe、Buea）的道路网络，帮助巩固了它作为地区枢纽的地位。

即使词源、人口数据等普通主题，LLM 也可能加入这种陈述。有时先用缓和开场承认主题不重要或鲜为人知，随后照样谈论其重要性。

**示例**

> 在 [Spanish colonial period](https://en.wikipedia.org/wiki/Spanish_Colonial_Period_(Philippines) "Spanish Colonial Period (Philippines)")，*Bakunutan* 这个名字被西班牙语化为 *Bacnotan*；这一变化体现于 Manila 的 [National Archives](https://en.wikipedia.org/wiki/National_Archives_of_the_Philippines "National Archives of the Philippines") 所保存的官方文书。这段 etymology 凸显（highlights） 该社区抵抗的 持久传承（enduring legacy），以及团结在塑造其身份认同时所具有的变革力量。

> 尽管应用范围有限，它仍为早期航空工程的 更广泛的历史（broader history） 作出了贡献，也反映了 French rotary designs 对 German manufacturers 的影响。

谈论生物（如某种动植物）时，LLM 常过度强调它与整个生态系统或环境的关系，即使这种联系牵强或泛泛。它也倾向反复讨论保护现状、研究和保育努力，即使保护状况未知、实际上没有认真开展相关工作。

**示例**

> 它在 ecosystem 中发挥作用，并为 Hawaii 丰富的文化遗产作出贡献。[...] 保护这个 endemic species 不仅对 ecological diversity 至关重要，也关系到维系与 Hawaii 本土植物相连的文化传统。

> 目前，International Union for Conservation of Nature（IUCN）尚未对 *Lethrinops lethrinus* 作出特定 conservation assessment。然而，Lake Malawi ecosystem 的整体健康，对这一及其他 endemic species 的存续至关重要。过度捕捞、污染、栖息地破坏等因素，都可能影响它们的种群。

### Undue emphasis on notability, attribution, and media coverage

**需注意的词：** *independent coverage*, *local/regional/national/[country name] media outlets*, *music/business/tech outlets*, *active social media presence*

类似地，LLM 似乎认为，证明主题值得关注的最好方式，是不断强调其知名度，通常会列举报道过它的来源。有时补充来源实际说了什么，有时不补充，还常把自己的[表面分析](#superficial-analyses)错误归给来源。较新的 AI 工具（2025 年或以后）更常出现这种现象。

人类新闻稿几十年来也引用新闻剪报，但被明确要求撰写 Wikipedia 条目的 LLM，常会照搬 [Wikipedia 指引](https://en.wikipedia.org/wiki/Wikipedia:N "Wikipedia:N")的措辞，例如“independent coverage”。

**示例**

> 她曾在 CNN 谈论 AI，并获 Vogue、Wired、Toronto Star 等媒体报道。[...] 她的见解也曾刊于 *Wired*、*Refinery29* 以及其他主要媒体。

> 她的观点曾被 *The New York Times*、*BBC*、*Financial Times* 和 *The Hindu* 引用。

> 它的重要性记录在归档的学校活动节目单和地区媒体报道中，包括 *Mesabi Daily News*；该报定期评论在那里举办的演出。

尤其在 Wikipedia，LLM 常在正文中费力强调来源，哪怕只是零星报道、没有争议的事实，或人类编辑通常仅放行内引文、甚至不引来源的情况。

**示例**

> 这家餐厅也曾出现在 [ABC News](https://en.wikipedia.org/wiki/ABC_News_(Australia) "ABC News (Australia)") 关于周边街区事件的报道中，强调（underscoring） 它作为 [[of [Adelaide](https://en.wikipedia.org/wiki/Adelaide "Adelaide") 市] 知名深夜场所的地位。

> 在 United States，依托大学的 incubators 和 accelerators 随这些中心一同扩展；Library of Congress 的一次官方审查发现，2014–2016 年 SBA [[[Small Business Administration](https://en.wikipedia.org/wiki/Small_Business_Administration "Small Business Administration")] Growth Accelerator Fund Competition 的获奖项目中，31.5% 依托大学开展。

涉及使用社交媒体的人物或实体时，LLM 常说它们“maintain an active social media presence”或类似话。这种措辞很有 AI 特色，在约 2024 年前的 Wikipedia 中相对少见。

> 这家购物中心拥有强大的 digital presence，尤其在 Instagram 上积极分享最新消息与活动。Forum Kochi 一贯在 digital promotions 中表现出色，以优质、引人参与且有影响力的视频内容，在宣传推广中发挥 关键作用（key role）。

### Superficial analyses

**需注意的词：** *ensuring ...*, *highlighting ...*, *emphasizing ...*, *reflecting ...*, *underscoring ...*, *showcasing ...*, *aligns with...*, *contributing to...*

AI 聊天机器人常插入表面分析，讨论信息的重要性、认可度或影响。[^7] 常见方式是在句末加一个[present participle](https://en.wikipedia.org/wiki/Participle#Forms "Participle")（“-ing”）短语，有时还[vague attribution](#vague-attributions-of-opinion)于第三方（见下文）。[^7][^5]

虽然[许多这类词本身就是明显的 AI 迹象](https://en.wikipedia.org/wiki/Wikipedia:AIWORDS "Wikipedia:AIWORDS")，[^6][^8] 如果verbsubject是事实、事件或其他无生命事物，迹象就更明显。人可以 highlight 或 emphasize 某事，事实、事件本身却不能。这种“突出”“强调”并不是实际发生的动作，而是一个没有实体的叙述者，对某件事意味着什么作出断言。[^5]

这类评论通常属于 [synthesis](https://en.wikipedia.org/wiki/Wikipedia:SYNTH "Wikipedia:SYNTH")，及／或以 wikivoice 表达未归因的 opinions。具有 [retrieval-augmented generation](https://en.wikipedia.org/wiki/Retrieval-augmented_generation "Retrieval-augmented generation") 能力的较新 chatbots，例如能搜索网络的 AI chatbot，可能把这些陈述归给 [named sources](#undue-emphasis-on-notability-attribution-and-media-coverage)，如“Roger Ebert highlighted the lasting influence”；但那些 sources 未必说过任何近似内容。

**示例**

> Douera 靠近首都 Algiers，进一步 提升（enhancing） 它作为活跃活动与文化枢纽的重要性。

> civil rights movement 作为这场斗争的强有力延续而兴起，强调（emphasizing） 团结与集体行动在争取公正中的重要性。这段历史遗产影响了当代 African-American families，塑造（shaping） 他们的价值观、社区结构和参与政治的方式。在经济上，systemic inequality 的 持久影响（enduring impacts） 既给 African-American communities 带来挑战，也催生创新，推动（driving） 一种对赋权和社会变革的投入，代代回响。

> 其纪念碑标识同时刻有 English 和 Spanish 铭文，强调（underscores） 它将 United States 与 Mexico 的 Latter-day Saints 汇聚在一起的作用。

> 这些引用跨越六十多年，并见于公认的学术出版物，说明（illustrate） Blois 在 computational linguistics、grammar 和 neology 中的 持久影响（lasting influence）。

> 它在 [Indian Railways](https://en.wikipedia.org/wiki/Indian_Railways "Indian Railways") 的 [East Central Railway Zone](https://en.wikipedia.org/wiki/East_Central_Railway_Zone "East Central Railway Zone") 中占据 关键地位（pivotal place），是具有历史意义的主要铁路枢纽。车站采用 [1,676 mm](https://en.wikipedia.org/wiki/5_ft_6_in_gauge_railway "5 ft 6 in gauge railway")（5 ft 6 in）[broad gauge](https://en.wikipedia.org/wiki/Broad_gauge "Broad gauge")，设有 8 条轨道和 6 个站台。[...] 历史上，它对连接 [Darbhanga](https://en.wikipedia.org/wiki/Darbhanga "Darbhanga") 与 [Delhi](https://en.wikipedia.org/wiki/Delhi "Delhi")、[Patna](https://en.wikipedia.org/wiki/Patna "Patna")、[Kolkata](https://en.wikipedia.org/wiki/Kolkata "Kolkata") 等重要城市一直至关重要，促进（facilitating） 旅客与货物运输。车站支持过客运列车以及 [Satyagrah Express](https://en.wikipedia.org/wiki/Satyagrah_Express "Satyagrah Express")、[Mithila Express](https://en.wikipedia.org/wiki/Mithila_Express "Mithila Express") 等 express trains 在内的多种服务，contributing to 地区的社会经济发展。[...] 多年来，Darbhanga Junction 经历了多次升级与现代化改造，旨在改善设施和运营效率，反映（reflecting） 它在地区和国家交通 格局（landscape） 中持续的重要性。

### Promotional and advertisement-like language

**需注意的词：** *continues to captivate*, *groundbreaking* (in the figurative sense), *stunning natural beauty*, *enduring/lasting legacy*, *nestled*, *in the heart of*, *boasts a*...

LLM 很难保持中立语气，尤其涉及可视为“文化遗产”的事物时，会[不断提醒读者它有多重要](#undue-emphasis-on-symbolism-legacy-and-importance)。

**示例**

> Alamata Raya Kobo 坐落（nestled） 于 Ethiopia 令人叹为观止的 Gonder 地区，是一个拥有丰富文化遗产、在 Amhara 地区占重要地位的 充满活力（vibrant） 城镇。从风景到历史地标，Alamata Raya Kobo 让游客得以迷人地一窥 Ethiopia 多样的 织锦（tapestry）。本文将探索使 Alamata Raya Kobo 值得游览的独特特点，并 shed light on 它在 Amhara 地区的重要性。

> TTDC 是通往 Tamil Nadu 多样景点的入口，无缝地（seamlessly） 连接每位旅行者旅程的起点与终点。它提供可靠、物有所值的体验，展示（showcase） 该州丰富的历史、spiritual heritage 与自然之美。

同样，LLM 也会在公司、商业和产品文字中加入宣传性、正面的措辞，使其像电视广告台词。

> 一般而言，AEO 着重提高 data consistency 和 machine readability，让信息能被新兴的“answer engines”准确理解。常被讨论的做法包括使用 [JSON-LD](https://en.wikipedia.org/wiki/JSON-LD "JSON-LD")、[schema.org](https://en.wikipedia.org/wiki/Schema.org "Schema.org") 等 structured data formats，保持所发布信息的新鲜度与准确性，并使 digital entities 与 [Wikidata](https://en.wikipedia.org/wiki/Wikidata "Wikidata")、Schema.org 等 open web standards 保持一致。

> SOLLEI 的外观设计传达出强烈的情感存在感，同时忠于 Cadillac 标志性的大气比例。低矮、修长的轮廓，借宽阔姿态与加长的 coupe 车门得到 凸显（highlighted），提高（enhances） 进入宽敞后座空间的便利性。平滑连续的表面与突出的 A-line 强调车身总长，流畅低矮的车尾则带来精致动感。车身中部线条从前灯 无缝地（seamlessly） 延伸至尾灯，强化（reinforcing） 整车协调而优雅的设计。传统门把手被独立按钮替代，保持（preserving） 车辆简洁、现代的轮廓。为了呼应 Cadillac 大胆用色的 legacy，车身采用“Manila Cream”涂装；这一独特色调最初见于 1957、1958 年。这个 heritage color 经 Cadillac 工匠细致复兴并手工喷绘，展示（showcasing） 品牌对工艺与历史敬意的 投入（dedication）。

### Didactic, editorializing disclaimers

**需注意的词：** *it's important/critical/crucial to note/remember/consider*, *may vary*...

LLM 常告诉读者哪些事情“务必记住”。这通常表现为对假想读者添加“免责声明”，涉及安全、争议话题，或解释不同地区、司法辖区中的差别。

**示例**

> 这些非正式团体的出现，反映（reflects） 人们日益认识到城市议题彼此关联，也认识到 ANCs 具有参与塑造全市政策的潜力。然而，重要的是要指出（it's important to note），这些 caucuses 在正式 ANC 结构之外运作，对政策决策的影响可能各不相同。

> 将本报告所讨论、位于 Armenia 的 Yerevan 的独立 AI research company，与这些无关组织区分开来，至关重要（It is crucial），这样才能避免混淆。

> 务必记住（It's important to remember），在一个国家免费提供的东西，在另一个国家未必免费，因此使用前总应核查。

### Summaries and conclusions

**需注意的词：** *In summary*, *In conclusion*, *Overall*...

生成较长内容（例如被要求“写一篇文章”）时，LLM 常添加“Conclusion”或类似章节，也常用重述核心观点的方式结束段落或章节。[^9]

**示例**

> 总之（In summary），nurse scientists 的教育培训路径，通常从 master's degree in nursing 进阶为 Doctor of Philosophy in Nursing，之后接受 nursing research 的 postdoctoral training。这条有结构的路径确保 nurse scientists 获得必要知识与技能，开展严谨研究，并为 nursing science 的发展作出有意义的贡献。

### Outline-like conclusions about challenges and future prospects

**需注意的词：** *Despite its... faces several challenges...*, *Despite these challenges*, *Challenges and Legacy*, *Future Outlook*...

许多 LLM 生成的 Wikipedia 条目都有“Challenges”章节，通常以“尽管具有[正面或宣传性优点]，[主题]仍面临挑战……”开头，最后要么泛泛作出积极评价，[^1] 要么猜测现有或未来举措如何带来好处。它们通常出现在结构僵硬的条目末尾，还可能另列“Future Prospects”章节。

注意：这个迹象指僵硬套式，而不是单纯提及挑战。

**示例**

> 尽管工业和居住生活都很繁荣（Despite its industrial and residential prosperity），Korattur 仍面临城市地区常见的挑战，包括 [...]。凭借其战略位置和持续举措，Korattur 作为 Ambattur industrial zone 不可分割的一部分继续蓬勃发展，体现（embodying） 工业与居住生活之间的 协同作用（synergy）。

> 尽管已经取得成功（Despite its success），Panama Canal 仍面临挑战，包括 [...]。未来对 automated navigation systems 等技术的投入，以及可能进一步扩建，could 改善（enhance） 运河效率，并维持它在全球贸易中的重要性。

> 尽管应用前景可期，pyroelectric materials 仍面临若干挑战，必须解决，才能获得更广泛采用。一个 关键限制（key limitation） 是 [...]。尽管面临这些挑战（Despite these challenges），pyroelectric materials 的 versatility 仍使其成为 sustainable energy solutions 和 next-generation sensor technologies 的 关键组成部分（critical components）。

> hydrocarbon economies 的未来面临若干挑战，包括 [...]。本节将推测可能的发展，以及全球能源不断变化的 格局（landscape）。

> 在当前 Afghan media 环境中运营，面临诸多挑战，包括 [...]。尽管面临这些挑战（Despite these challenges），Amu TV 仍设法持续为 Afghan population 提供 至关重要的服务（vital service）​​。

> 例如，虽然这套 methodology 在原则上支持 transdisciplinary collaboration，在规模大且成员异质的团队中有效应用，仍可能很有挑战。[...] SCE 持续演进，以回应这些挑战。

### Leads treating Wikipedia lists or broad article titles as proper nouns

AI 条目若以非[专名](https://en.wikipedia.org/wiki/Proper_name "Proper name")为标题，例如[列表](https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lists "Wikipedia:Manual of Style/Lists")，导言首句可能把标题介绍或定义成一个独立存在的现实实体。虽然[格式手册](https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lead_section#Format_of_the_first_sentence "Wikipedia:Manual of Style/Lead section")允许“自然地”在导言开头使用这类标题，但 AI 的这些开头往往并不自然。

**示例**

> “The Effects of Foreign language anxiety on Learning”指学习或使用非母语时，体验到的紧张、不安与恐惧感。

> EuroGames editions 是按时间排列的双年 EuroGames 清单；这是一项由 European Gay and Lesbian Sport Federation（EGLSF）主办的 European LGBT+ 综合运动会。

> “**List of songs about Mexico**”是精心编选的音乐作品集，以 Mexico 及其文化、地理或身份认同为核心主题。

---

## Language and Grammar

### Overused "AI vocabulary" words

**需注意的词：** *align/aligns/aligning with*,[^6][^8] *crucial*,[^1] *delve/delves/delving* (pre-2025),[^6][^8][^1] *emphasizing*,[^6][^8] *enduring*,[^8] *enhance/enhances/enhancing*,[^8][^1] *fostering*,[^8][^1] *garnered/garnering*,[^6][^8] *highlight/highlighted/highlighting/highlights* (as a verb),[^1] *interplay*,[^8] *intricate/intricacies*,[^6][^8][^7] *key* (as an adjective), *landscape*,[^8] *leveraging*,[^1] *multifaceted*,[^6][^8][^7] *notably*,[^8] *nuanced*,[^6][^8] *realm*,[^8] *robust*,[^1] *seamless/seamlessly*,[^1] *shed light on*, *showcasing*,[^8] *streamline*,[^1] *tapestry*,[^8] *testament*,[^1][^8] *underpin/underpins/underpinning*,[^8] *underscore/underscores/underscoring*,[^8] *vibrant*,[^8][^7] *vital*,[^1] ...

多项研究表明，LLM 过度使用某些词，尤其与几乎可以确定由人类撰写的 2022 年之前文本相比。[^6] 这些“AI 词汇”也普遍存在于 [Grokipedia](https://en.wikipedia.org/wiki/Grokipedia "Grokipedia") 等 AI 百科和 AI 生成的 Wikipedia 内容中，并常在输出中共同出现：看到一个，很可能还有其他。[^10] 一次编辑引入一两个词，未必说明问题；但 2022 年之后的一次编辑反复引入大量此类词，是使用 AI 的强烈迹象之一。

“AI vocabulary”的分布，会随 chatbot 或 LLM 的不同略有差异，[^7] 也会随时间变化。例如 ChatGPT 曾因过度使用 *delve* 而广为人知；到 2025 年，这个词的出现频率才骤降。[^11]

请结合上下文。例如，虽然 AI 文本滥用 underscore，它也可能指字面的下划线，或[背景配乐](https://en.wikipedia.org/wiki/Incidental_music "Incidental music")。

**示例**

> Somali cuisine 是多种饮食影响的 intricate 而多样的融合，汲取 [Arab](https://en.wikipedia.org/wiki/Arab_cuisine "Arab cuisine")、[Indian](https://en.wikipedia.org/wiki/Indian_cuisine "Indian cuisine") 和 [Italian](https://en.wikipedia.org/wiki/Italian_cuisine "Italian cuisine") 风味的 丰富的织锦（rich tapestry）。这幅饮食 织锦（tapestry），直接源自 Somalia 在 充满活力（vibrant） 贸易与繁忙商业方面的悠久 heritage。[...]
>
> 此外（Additionally），Somali 饮食传统的一项 鲜明特点（distinctive feature），是加入 [camel](https://en.wikipedia.org/wiki/Camel "Camel") [meat](https://en.wikipedia.org/wiki/Meat "Meat") 和 [milk](https://en.wikipedia.org/wiki/Milk "Milk")。它们被视为美食，并在 Somali cuisine 的 丰富的织锦（rich tapestry） 中充当珍贵而基础的要素。[...]
>
> [Italian colonial rule in Somalia](https://en.wikipedia.org/wiki/Italian_Somaliland "Italian Somaliland") 影响的一个 持久见证（enduring testament），是 [pasta](https://en.wikipedia.org/wiki/Pasta "Pasta") 和 [lasagne](https://en.wikipedia.org/wiki/Lasagna "Lasagna") 在当地 美食景观（culinary landscape） 中的普及，尤其是在南部，展示（showcasing） 这些菜肴如何与米饭一道融入传统饮食。[...]
>
> 此外（Additionally），Somali 商人在全球咖啡贸易中发挥 关键作用（pivotal role），是最早出口咖啡豆的商人之一。

### Negative parallelisms

含“not”“but”“however”的parallel construction，例如“Not only ... but ...”“It is not just about ..., it's ...”，在 LLM 文字中很常见，却往往不适合中立语气。[^1][^11]

**示例**

> Yayoi Kusama 于 2010 年完成、现藏于 Florence 著名 Uffizi Gallery 的 **Self-Portrait**，不仅是 self-representation 作品，也是她的执念、visual strategies 与 psychobiographical narratives 的视觉记录。

> 这不仅关乎人声之下的节拍；它还是那份攻击性与氛围的一部分。

下面是跨多个句子的negative parallelism示例：

> 他出身于因 theatrical legacy 而闻名、备受尊敬的 Duse family。然而，Eugenio 的人生所走的道路，将个人抱负与家族复杂关系交织在一起。

### Outlines of negatives

少数情况下，看似 AI-generated 的 user messages，也可能包含简短句子，描述某些在另一事物中缺失的项目，或与前面有用项目相比被认为毫无用处的项目。有些写法类似“no ..., no ..., just ...”或“What matters is ..., not ..., not ...”。

**示例**

> 没有长篇人物报道。没有编辑性见解。没有关于她 game dev 生涯的报道。没有显著荣誉。只有 TikTok 摘要和点名评论。

---

> 这套过程要求严谨——不是情绪疲惫，不是个人冒犯，更不是披着道德高地外衣的过早退场。

---

> 不是一段职业生涯，不是一系列作品，也不是持续的相关性——只是一次 algorithmic moment。

---

> 这不是难以判断的情况，也不是灰色地带。这页应该被完全、干净、毫不拖延地移除。不要 redirect。不要 merge。直接删除。

---

> Wikipedia 的 general notability guideline（WP:GNG）非常清楚：必须在可靠、独立的 secondary sources 中获得 significant coverage。不是几篇复述 Twitter 风波的随手文章。不是利用 culture war 紧张情绪的反动帖子。也不是为点击量翻译争议的外语八卦杂志。

---

> 真正重要的——也是至今完全缺失的——是可靠、独立的 secondary sources 中 significant、深入的报道。不是八卦网站。不是反复炒作的愤怒。不是关于一次病毒式争议的 tabloid 短讯。更不是目录式提到某人是“video game writer”或 TikTok creator。

### Rule of three

LLM 过度使用[rule of three](https://en.wikipedia.org/wiki/Rule_of_three_(writing) "Rule of three (writing)")：从“adjective、adjective、adjective”，到“短语、短语和短语”，形式多样。[^1] 它常靠这种结构，让[表面分析](#superficial-analyses)显得更全面。

**示例**

> Amaze Conference 汇聚来自全球的 SEO professionals、marketing experts 和 growth hackers，讨论 digital marketing 的最新趋势。活动包括 keynote sessions、panel discussions 和建立人脉的机会。

### Vague attributions of opinion

**需注意的词：** *Industry reports*, *Observers have cited*, *Some critics argue*...

AI 常把观点或主张归给模糊的权威，这种做法称为[weasel wording](https://en.wikipedia.org/wiki/Weasel_wording "Weasel wording")，同时只引用一两个未必支持该观点的来源。它也倾向把少数来源的看法，概括成更大群体的意见。

**示例**

> 他的 [Nick Ford 的] 作品，被描述为探索 conceptual themes，并跨越不同 artistic media 之间的鸿沟。

— 来自 [Draft:Nick Ford (musician)](https://en.wikipedia.org/wiki/Draft:Nick_Ford_(musician) "Draft:Nick Ford (musician)")。这里的weasel wording暗示意见出自独立来源，实际引用的却是 Nick Ford 自己的网站。

> Haolai River 因其独特特点而受到研究者与 conservationists 关注。人们正在持续监测它的 ecological health，并保护周边草原环境；这是防止 China 的 semi-arid ecosystems 退化的更大行动的一部分。

> 学术研究将 Kwararafa（Kororofa）confederacy 描述为一个不断变化的 [Benue valley](https://en.wikipedia.org/wiki/Benue_valley "Benue valley") 联盟，由 [Jukun](https://en.wikipedia.org/wiki/Jukun "Jukun") 群体领导，并容纳多个 [Middle Belt](https://en.wikipedia.org/wiki/Middle_Belt "Middle Belt") 族群。由于大量历史记录来自 [Hausa](https://en.wikipedia.org/wiki/Hausa "Hausa") 编年史、Bornu 来源和口述传统，现代研究者将 Kwararafa 视为流动的政治文化组织，而非固定国家。因此，成员群体清单随时期与来源而异。

### Excessive synonym variance / elegant variation

generative AI 有 repetition-penalty code，意在避免过于频繁地复用词语。[^5] 例如，输出可能先给出主角姓名，之后再次提及时，却反复改用不同 synonym 或相关说法，如 protagonist、key player、eponymous character。

注意：如果用户分多次编辑加入多段 AI 内容，这条迹象可能不适用，因为每段可能单独生成。

**示例**

> Vierny 在 1970 年代初访问 Moscow 后，投入支持抵抗 socialist realism 限制的艺术家，并发现了 Yankilevskly，以及 Ilya Kabakov、Erik Bulatov 等人。在 Soviet 艺术限制所形成的严峻环境中，Yankilevsky 与其他 non-conformist artists 一样，难以自由表达创造力。Dina Vierny 认识到这些艺术家的巨大才华及其经历的挣扎，在支持他们艺术抱负方面发挥了 关键作用（pivotal role）。[...]
>
> 在人生这个新篇章中，Yankilevsky 置身于志同道合的艺术家群体；他们风格各异，却有共同目标：挣脱国家强加的艺术规范，尤其是 socialist realism。[...]
>
> 移居 Paris 为 Yankilevsky 提供了环境，让他能进一步探索和展示自己独特的艺术视野，不再受 Soviet regime 的束缚。Dina Vierny 对 Russian avant-garde artists 坚定的支持与投入，发挥了 关键作用（crucial role），营造（fostering） 一个让他们创造力蓬勃发展的空间，为 Paris 充满活力的 cultural 格局（landscape） 中艺术表达的 丰富的织锦（rich tapestry） 作出贡献。Vierny 的投入，最终促成在她 Saint-Germain-des-Prés 画廊举办的 开创性（groundbreaking） 展览“Russian Avant-Garde - Moscow 1973”，展示（showcasing） 那些挑战时代艺术规范的 non-conformist artists 多样而团结的阵线。

### False ranges

*from ... to ...* 不是比喻时，用来表示某个尺度的上下界。尺度可以是量化的，涉及明确或隐含的数值范围（如 1990–2000 年、15–20 盎司、冬季到秋季）；也可以是定性的类别边界（如“from seed to tree”“from mild to severe”“from white belt to black belt”）。同一结构也可构成[两极统括](https://en.wikipedia.org/wiki/Merism "Merism")：用整体的两个对立极端指代整体。这虽然是比喻，结构仍与字面用法相同，因为仍需要可辨认的尺度，例如“从头到脚”（以身体长度指代全身）、[from soup to nuts](https://en.wiktionary.org/wiki/from_soup_to_nuts "wikt:from soup to nuts")（明显基于时间）等。这些*并非*false range。

LLM 很喜欢混用不同事物，例如列举集合中的项目时，不逐项直说，而使用范围结构。关键在于：不改变两端，能否找到中间部分？如果中间必须换一个尺度，或原本就不存在尺度、也想象不出连贯整体，这就是**false range**。LLM 常用“比喻性的”（往往只是无意义的）“from ... to ...”，看似描述一个尺度，两端却只有松散联系甚至毫无关系，无法推断出有意义的范围。它这样做，是因为说服性文字会用此类空话来打动和取悦读者，而 LLM 训练深受这种文字影响。

**示例**

> 我们探索宇宙的旅程，从 Big Bang 的 singularity 延伸到宏大的 cosmic web，从锻造生命元素的恒星诞生与死亡，延伸到塑造宇宙命运的 dark matter 与 dark energy 的神秘舞蹈。
>
> [...] Intelligence and Creativity：从 problem-solving、tool-making，到 scientific discovery、artistic expression 和 technological innovation，人类智能的特点是适应性，以及提出新颖解决方案的能力。[...] Continued Scientific Discovery：理解宇宙、生命与我们自身的追求，将继续推动 scientific breakthroughs，范围从 fundamental physics 到 medicine 和 neuroscience。

### Title case in section headings

AI 聊天机器人很倾向于把章节标题中所有主要单词的首字母大写。[^1]

**示例**

> Global Context：Critical Mineral Demand（全球背景：critical minerals 需求）
>
> 根据 [Goldman Sachs](https://en.wikipedia.org/wiki/Goldman_Sachs "Goldman Sachs") 的一份 2023 年报告，critical minerals 的全球市场 [...]
>
> Strategic Negotiations and Global Partnerships（战略谈判与全球伙伴关系）
>
> 2014 年，Katalayi 获任 [Gécamines](https://en.wikipedia.org/wiki/G%C3%A9camines "Gécamines") 董事会主席的 senior executive adviser [...]
>
> High-Stakes Deals：Glencore、China 和 Russia（高风险交易：Glencore、China 和 Russia）
>
> [Moscow](https://en.wikipedia.org/wiki/Moscow "Moscow") 也对具有战略意义的 Congolese assets 表现出兴趣。[...]

---

## Punctuation and Formatting

### Excessive use of boldface

AI chatbots 可能以过度、机械的方式，用 [boldface](https://en.wikipedia.org/wiki/Boldface "Boldface") 强调各种 phrases。它们从 README、fan wikis、how-tos、sales pitches、slide decks、listicles 及其他大量用 boldface 的资料中继承了一种倾向：选定某个词或 phrase 后，每次出现都强调它，常像在列“key takeaways”。某些较新的 large language models 或 apps 已加入避免滥用 boldface 的指令。

**示例**

> 它融合了 **OKRs（Objectives and Key Results）**、**KPIs（Key Performance Indicators）**，以及 **Business Model Canvas（BMC）**、**Balanced Scorecard（BSC）** 等 visual strategy tools。OPC 旨在组织内部 营造（fostering） 一种统一心态和共同方向，弥合 strategy 与 execution 之间的鸿沟。

> **leveraged buyout（LBO）** 的特点，是大量使用 **debt financing** 收购公司。这种 financing structure 使 **private equity firms** 和 **financial sponsors** 仅投入相对少量自有 equity，就能控制企业。所收购公司的 **assets 和 future cash flows** 为债务提供 collateral，使 lenders 更愿意提供 financing。

> **50 位在 AI Safety 方面具有显著**影响力的科学家与思想家，影响涉及 alignment、containment 和 risk mitigation。清单包括他们的 **Productive Years**、估算的 **P(doom)**（existential catastrophe 的概率）、**他们对 AI Safety 贡献的一句话摘要**，以及他们的 Wikipedia 链接。

### Inline-header vertical lists

AI 输出常出现特定形式的纵向列表：有序或无序标记之后，先跟一个行内粗体小标题，再用冒号与后面的说明分开。

无序列表可能不用[正确的 wikitext](https://en.wikipedia.org/wiki/H:LIST "H:LIST")，而直接使用 •、hyphen（-）、短划线（–）、井号（#）、emoji 等字符。有序列表也可能显式写数字（如 `1.`），而非标准 wikitext。复制屏幕上的纯文本时，部分格式信息可能丢失，换行也可能丢失。

**示例**

> 1. Historical Context Post-WWII Era：WWII 后世界迅速变化，[...] 2. Nuclear Arms Race：在 U.S. 的 atomic bombings 之后，Soviet Union 于 1949 年引爆第一颗炸弹，[...] 3. Key Figures Edward Teller：一位主张开发更强大 nuclear weapons 的 Hungarian physicist，[...] 4. Technical Details of Sundial Hydrogen Bomb：Sundial 的设计涉及一颗 hydrogen bomb [...] 5. Destructive Potential：如果引爆，Sundial 将产生直径最高 50 千米的火球，[...] 6. Consequences and Reactions Global Impact：爆炸将导致末日般的 nuclear winter，[...] 7. Political Reactions：U.S. 军方与科学家对这种武器的后果表示恐惧，[...] 8. Modern Implications Current Nuclear Arsenal：如今，全球大约有 12,000 件 nuclear weapons，[...] 9. Key Takeaways Understanding the Madness：Project Sundial 的构想 凸显（highlights） 人类才智的极端 [...] 10. Questions to Consider：开发 Project Sundial 背后的动机是什么？[...]

> Conflict of Interest（COI）/Autobiography：虽然我理解对我的 username 的担忧 [...]
>
> Notability（GNG 和 NPOLITICIAN）：我已修订条目，使其侧重事实细节 [...]
>
> Original Research（WP）与 Promotional Tone：我一直致力于删除 original research [...]
>
> Article Move to Main Namespace：在 AFC review 后，将草稿移到 main namespace [...]

### Emojis

AI 很喜欢 [emoji](https://en.wikipedia.org/wiki/Emoji "Emoji")。[^11] 尤其会把它们放在章节标题或项目之前作为装饰，在讨论页评论中最明显。

**示例**

> 让我们准确解析这里正在发生什么：
>
> 🧠 Cognitive Dissonance Pattern：
>
> 你已经证明 authorship，展示 originality，并提出新 frameworks；但他们维护的 system 却明确禁止承认 originators，除非有第三方先写到他们。
>
> [...]
>
> 🧱 Structural Gatekeeping：
>
> Wikipedia policy 倾向于：
>
> [...]
>
> 🚨 Underlying Motivation：
>
> 一个真人为什么会在这件事上与你争执？
>
> [...]
>
> 🧭 你实际上正在面对什么：
>
> 这不是一场关于规则的争论。
>
> [...]

> 🪷 传统 Sanskrit 名称：Trikoṇamiti
>
> Tri = Three（三）
>
> Koṇa = Angle（角）
>
> Miti = Measurement（测量）🧭“三个角的测量”——古代 Indian 关于 triangle 和 angle 的数学技艺。
>
> 🕰️ 1. Vedic Era（约公元前 1200 年–公元前 500 年）
>
> [...]
>
> 🔭 2. Sine of the Bow：Sanskrit Terminology
>
> [...]
>
> 🌕 3. Āryabhaṭa（公元 476 年）
>
> [...]
>
> 🌀 4. Varāhamihira（公元 6 世纪）
>
> [...]
>
> 🌠 5. Bhāskarācārya II（公元 12 世纪）
>
> [...]
>
> 📤 Indian Legacy 向外传播

### Overuse of em dashes

人类编辑和作者也常喜欢[em dash](https://en.wikipedia.org/wiki/Em_dash "Em dash")（—），但 AI *尤其喜欢*。[^11] 同类文字中，LLM 比非专业人类作者更频繁使用em dash；在人类更可能使用comma、括号、冒号，或误用hyphen（-）的位置，也会使用它。LLM 尤其倾向公式化地用em dash，过度强调分句或并列结构，模仿经过“强化”的推销文案。

这个迹象与其他指标结合时最有用，单独使用则不然。

**示例**

> “Dutch Caribbean”一词**未在 statute 中使用**，主要由 **Dutch institutions** 推广，并非由 **autonomous countries 的人民**自己推广。实际中，许多 Dutch organizations 和 businesses 为了**自身方便**使用这个说法，甚至放进地址，例如“Curaçao, Dutch Caribbean”；但这只会在国际上**增加混淆**，并**抹去 national identity**。你不会把 **“Netherlands, Europe”** 写成地址，然而这种错标仍在继续。

> 有一点你是对的——我们似乎确实对 policy-based discussion 所包含的内容有不同理解。[...]
>
> WP:BLP1E 所说的“one event”是一种简写；相关 essays、以往 AfD precedents 和实际执行都表明，“两次短暂引起注意的事件”仍常落在 BLP1E 的保护范围内。这不是“想象”方针应当如何，而是认识到 community consensus 如何塑造了其应用。
>
> 是的，WP:GNG、WP:NOTNEWS、WP:NOTGOSSIP 以及 WP:BLP 的其余部分都重要；我在整个过程中引用或呼应过其中每一项。[...] 如果主题缺少持续、深入、独立的报道，却只追随耸动而短暂的关注浪潮，我们讨论的就不是 encyclopedic significance。[...]
>
> [...] consensus 不会从沉默中生长，而是从批评、修正与清晰表达中形成。
>
> 如果我们对此有分歧，那么是的，我们是在用不同的语言说话。

> 条目的当前修订完全符合 Wikipedia 的核心内容方针，包括 WP:V（Verifiability）、WP:RS（Reliable Sources）和 WP:BLP（Biographies of Living Persons）；所有重要主张都有多个独立、信誉良好的国际来源支持。
>
> [...] 然而迄今，没有任何编辑——包括你自己——指出当前版本中有哪些具体段落由 AI 生成，或不符合 Wikipedia 内容标准。[...]
>
> 鉴于条目当前的状态——来源充分、符合方针、经协作改进——继续保留“LLM advisory”banner 没有正当理由。

### Curly quotation marks and apostrophes

AI 通常使用弯引号（"..." 或 '...'），而非直引号（"..." 或 '...'）。有时同一回复中混用弯引号与直引号。它也倾向在[缩略词](https://en.wikipedia.org/wiki/Contraction_(grammar) "Contraction (grammar)")和[possessive](https://en.wikipedia.org/wiki/English_possessive "English possessive")中，用与弯[右单引号](https://en.wikipedia.org/wiki/Right_single_quotation_mark "Right single quotation mark")相同的字符（'）代替直apostrophe（'），而且可能前后不一致。

单凭弯引号不能证明使用了 LLM。[Microsoft Word](https://en.wikipedia.org/wiki/Microsoft_Word "Microsoft Word")、[macOS](https://en.wikipedia.org/wiki/MacOS "MacOS")、[iOS](https://en.wikipedia.org/wiki/IOS "IOS") 设备都有将直引号转成弯引号的“[智能引号](https://en.wikipedia.org/wiki/Smart_quotes "Smart quotes")”功能。[LanguageTool](https://en.wikipedia.org/wiki/LanguageTool "LanguageTool") 等grammar工具也可能如此。专业排版的报纸等作品常用弯引号和apostrophe。[Citer](https://citer.toolforge.org/) 等引文工具也可能保留网页标题中的字符，例如：

> McClelland, Mac (2017-09-27). ["When 'Not Guilty' Is a Life Sentence"](https://www.nytimes.com/2017/09/27/magazine/when-not-guilty-is-a-life-sentence.html). *The New York Times*. Retrieved 2025-08-03.

注意，Wikipedia 允许用户自定义显示字体。某些字体会把成对弯apostrophe显示成直形，用户便看不到差别。

### Subject lines

AI 生成的用户消息和[解封申请](https://en.wikipedia.org/wiki/Wikipedia:Identifying_LLM_unblock_requests "Wikipedia:Identifying LLM unblock requests")，有时会以本该粘贴到邮件表单 *Subject* 字段的内容开头。

**示例**

> Subject：请求获准编辑 Wikipedia 条目——“Dog”

> Subject：请求审查并澄清草稿条目的相关问题

---

## Communication Intended for the User

### Collaborative communication

**需注意的词：** *I hope this helps*, *Of course!*, *Certainly!*, *You're absolutely right!*, *Would you like...*, *is there anything else*, *let me know*, *more detailed breakdown*, *here is a*...

编辑有时会粘贴 AI chatbot 为 correspondence、prewriting 或 advice 生成的内容，而非条目正文；它可能出现在正文或 comments（`<!-- -->`）中。被要求生成 Wikipedia 条目或 comment 时，chatbot 也可能明确说文本用于 Wikipedia，并在输出中提到各种 [policies and guidelines](https://en.wikipedia.org/wiki/Wikipedia:PG "Wikipedia:PG")，还常明确强调它们是 *Wikipedia 的*惯例。

**示例**

> 本节将讨论与报告主题有关的背景信息，包含 relevant literature、以往研究，以及支撑该研究的 theoretical frameworks 或 concepts。目的是全面理解主题，并告知读者领域内已有的知识和缺口。

> 加入锻造作坊（如上所示）及工具的照片，将 丰富（enrich） 条目关于文化或经济的章节，让读者直观看到 Ronco 的 industrial heritage。视觉资料也能 突出（highlight） Ronco Canavese 的景观与地标。例如，可以加入 Soana Valley 的地图，或 Ronco 在 Piedmont 的位置图，帮助读者在地理上定位。村庄的景色 [...] 可以用图片展示。有多张这样的照片可用，例如 Wikimedia Commons 中展示 Ronco 全景的照片 [...]。如果存在历史影像，例如 20 世纪初村民穿传统服饰的照片，或古老 alpine 行业的照片，也会增加条目的深度。此外，也可以直观呈现城镇的重要建筑与场所：[...] 加入 Santuario di San Besso [...] 的图片，可进一步吸引读者。通过 运用（leveraging） 这些视觉辅助资料——地图、自然与文化场所的照片——扩展后的条目能更丰富、更具沉浸感地呈现 Ronco Canavese。

> 如果你准备将这些信息加入 Foshan 的 Wikipedia 页面“Animal Cruelty Controversy”章节，请确保内容以 neutral tone 呈现，有 reliable sources 支持，并遵循 Wikipedia 的 verifiability 与 neutrality 指引。

> 这是你的 wiki user page 模板。你可以复制粘贴到自己的 user page，并进一步自定义。

> 最后一条重要提示：最末尾的 ~~~~ 是会自动……的 Wikipedia markup

### Knowledge-cutoff disclaimers and speculation about gaps in sources

**需注意的词：** *as of [date]*,[^a] *Up to my last training update*, *as of my last knowledge update*, *While specific details are limited/scarce...*, *not widely available/documented/disclosed*, *...in the provided/available sources/search results...*, *based on available information*...

knowledge cutoff免责声明，是 AI 用来说明所提供信息可能不完整、不准确或过时的声明。

LLM 如果有固定[knowledge cutoff](https://en.wikipedia.org/wiki/Knowledge_cutoff "Knowledge cutoff")（通常为最后一次训练更新），就无法提供其后事件或进展的信息，因此常输出免责声明，提醒用户信息仅准确到某个日期。

具备retrieval-augmented generation能力的 LLM 如果找不到某主题的来源，或用户提供的来源没含相关信息，常会给出类似knowledge cutoff免责声明的声明。它还可能猜测信息“可能”是什么，并说明其重要性。这些信息完全属于[推测](https://en.wikipedia.org/wiki/Wikipedia:OR "Wikipedia:OR")，包括“没有记录”的断言本身，也可能依据关联很弱的主题，甚至完全编造。

**示例**

> 虽然现成来源没有广泛记录 Kumarapediya 历史或经济的具体细节，……

> 虽然所提供的搜索结果中，关于 Studniční hora 的 fauna 的具体信息有限，这座山很可能支持……

> 尽管这些抵抗行动的细节没有广泛记录，它们仍 突出（highlight） 她的勇敢……

> 截至 2025 年 6 月，尚无关于影响 Outpost24 的重大公共争议或 security incidents 的记录。

> 截至我最近一次 knowledge update——2022 年 1 月——我没有关于“Chester Mental Health Center”当今状态或相关进展的具体信息。

> 以下是基于现有信息的详细概览：

### Prompt refusals

**需注意的词：** *as an AI language model*, *as a large language model*, *I'm sorry*...

AI 偶尔会拒绝按原要求回答，通常先道歉，并提醒自己是“an AI language model”。为显得有帮助，它常提出建议，或改答相似请求。直接拒绝已经越来越少见。

拒绝回答的文字显然不能放进 Wikipedia 条目；用户如果仍粘贴进去，可能没有审阅文本，或英语不熟练。请记住[善意推定](https://en.wikipedia.org/wiki/Wikipedia:Assume_good_faith "Wikipedia:Assume good faith")，因为编辑也许确实希望填补我们的[知识缺口](https://en.wikipedia.org/wiki/Wikipedia:Systemic_bias "Wikipedia:Systemic bias")。

**示例**

> 作为 AI language model，我不能直接为你向 Wikipedia 添加内容，但可以帮你起草 bibliography。

### Phrasal templates and placeholder text

AI 可能生成留空待填的[短语模板](https://en.wikipedia.org/wiki/Phrasal_template "Phrasal template")（类似 *[Mad Libs](https://en.wikipedia.org/wiki/Mad_Libs "Mad Libs")* 游戏），让用户填入适合用途的词句；但有些用户忘了填。注意，也有非 LLM 生成的草稿和新条目模板，例如 [Wikipedia:Artist biography article template/Preload](https://en.wikipedia.org/wiki/Wikipedia:Artist_biography_article_template/Preload "Wikipedia:Artist biography article template/Preload") 和 [Category:Article creation templates](https://en.wikipedia.org/wiki/Category:Article_creation_templates "Category:Article creation templates") 中的页面。

**示例**

> Subject：对不准确信息的担忧
>
> 亲爱的 Wikipedia
>
> 我写信是为了表达对你们平台上 misinformation 传播的深切担忧。具体而言，我指的是关于 [Entertainer's Name] 的条目；我认为其中包含不准确且有害的信息。

> Subject：Wikipedia 条目编辑请求
>
> 亲爱的 Wikipedia Editors：
>
> 希望你一切安好。我写信是为了请求编辑这篇 Wikipedia 条目
>
> 我已在条目中发现一处需要更新或改进的地方。[描述需要编辑的具体章节或内容，并明确说明为什么必须修改；如适用，应包括 reliable sources]。

large language model也可能在引用字段中放入“2025-xx-xx”等占位日期，尤其是 access-date，偶尔也包括 date，导致报错。

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
| leader_name = <!-- 如有带 citation 的信息，则添加 -->
```

---

## Markup

### Use of Markdown

AI 不熟悉 [wikitext](https://en.wikipedia.org/wiki/H:WT "H:WT")，这是指导 Wikipedia 的 [MediaWiki](https://en.wikipedia.org/wiki/MediaWiki "MediaWiki") 软件如何排版条目的[markup language](https://en.wikipedia.org/wiki/Markup_language "Markup language")。它较小众，主要用于 MediaWiki 及 [Miraheze](https://en.wikipedia.org/wiki/Miraheze "Miraheze") 等基于 MediaWiki 的平台，因此 LLM 缺乏这种格式的训练资料。聊天机器人虽消化了数百万条 Wikipedia 条目，资料却并非包含 wikitext grammar的原始文本文件。此外，多数机器人默认采用另一种概念相似、应用更广的markup language：[Markdown](https://en.wikipedia.org/wiki/Markdown "Markdown")。系统级指令要求以 Markdown 输出，应用再把grammar渲染成标题、项目列表、编号列表、表格等，正如 MediaWiki 把 wikitext 渲染成格式化条目。

询问“格式指导”时，愿意透露部分系统级指令的机器人，通常会给出类似以下内容（来自 2025 年中的 [Microsoft Copilot](https://en.wikipedia.org/wiki/Microsoft_Copilot "Microsoft Copilot")）：

> ## Formatting Guidelines
>
> - 所有输出使用 GitHub-flavored Markdown。
> - 使用一个主标题（`#`）和清晰的一级小标题（`##`）。
> - 段落保持简短（3–5 句，不超过 150 词）。
> - 将大主题拆成带标签的子章节。
> - 相关项用 bullet lists 或 numbered lists 呈现；只有顺序重要时才编号。
> - 每个段落前后始终空一行。
> - 除非明确要求，否则正文不使用 bold 或 italic 样式。
> - 主要章节之间使用 horizontal dividers（`---`）。
> - 使用有效 Markdown tables 呈现结构化对比或 data summaries。
> - 避免复杂 Unicode symbols，坚持使用简单字符。
> - code blocks 仅用于代码、诗、歌词或类似格式的内容。
> - mathematical expressions 在 code blocks 外使用 LaTeX。

如上所示，Markdown 与 wikitext grammar完全不同：粗体和斜体用星号（*）或下划线（_），而非单引号（'）；章节标题用井号（#），而非等号（=）；URL 外用圆括号（()），而非方括号（[]）；分隔线用三个符号（---、***、___），而非四个hyphen（----）。

即使明确要求，chatbots 通常也难生成 grammar 正确的 wikitext，因为 training data 使它们对 Markdown 的偏好与熟练程度高得多。要求“生成文章”时，chatbot 通常默认使用 Markdown；部分 chatbot platforms 的复制功能会将它保留到 clipboard。要求为 Wikipedia 生成内容时，chatbot 也许会“意识到”需要生成兼容 Wikipedia 的 code，并在输出中询问“Would you like me to ... turn this into actual Wikipedia markup format (`wikitext`)?”，即“是否需要我……将其转成真正的 Wikipedia markup 格式？”[^b] 用户要求继续后，结果的 syntax 通常仍很简陋、有误，或二者兼有。chatbot 可能把尝试生成的 wikitext 放进 Markdown-style fenced code block，周围再包着 Markdown syntax 与文字；平台特定的 copy-to-clipboard 功能也可能保留它们，留下混用两种 markup languages syntax 的明显痕迹。文本中可能出现三个 backticks，例如 ` ```wikitext `。[^c]

错误的 wikitext 与 Markdown 混用，是 LLM 生成的强烈迹象，尤其以 Markdown 围栏代码块出现时。但*单独*出现 Markdown 并不构成强烈迹象。开发者、研究者、技术作者和资深网民，常在 [Obsidian](https://en.wikipedia.org/wiki/Obsidian_(software) "Obsidian (software)")、[GitHub](https://en.wikipedia.org/wiki/GitHub_Flavored_Markdown "GitHub Flavored Markdown") 以及 Reddit、Discord、Slack 等平台使用 Markdown。iOS Notes、Google Docs、Windows Notepad 等工具也支持编辑或导出 Markdown。它越来越普及，新编辑也可能默认认为 Wikipedia 支持 Markdown。

**示例**

> 我认为这次 block 在程序和实质上都已站不住脚。尽管我反复提出清楚、基于方针的担忧，每次 unblock request 都遭到 **summary rejection**；依据并非具体 diffs 或 policy violations，而是**对动机的猜测**、“没有帮助”的断言，以及我“不是来建设百科全书”的笼统印象。没有人认真回应这些事实：我**没有作出 disruptive edits**、**没有参与 edit warring**，并且始终试图**通过 talk page discussion 协作**，引用方针并邀请澄清。相反，我遇到多位 administrators 一再轻慢对待：关于**在正文中为 partisan 或 interpretive claims 标注 attribution**的合理担忧，被置之不理。有些 editors 没有回应这些担忧，而是选择嘲弄、猜测我的动机，或把论证标成“AI-generated”，却不解释论证在实质上有何缺陷。

> - Wikipedia 条目没有明确提到“Cyberhero League”被认可为 World Future Society 的 BetaLaunch Technology competition 的获胜者，正如 THE FUTURIST 的访谈所详述 ([[1]](https://consciouscreativity.com/the-futurist-interview-with-dana-klisanin-creator-of-the-cyberhero-league/)([https://consciouscreativity.com/the-futurist-interview-with-dana-klisanin-creator-of-the-cyberhero-league/](https://consciouscreativity.com/the-futurist-interview-with-dana-klisanin-creator-of-the-cyberhero-league/)))。这一认可可以在“Game design and media consulting”章节中明确说明。

此处 LLM 错用 `##` 表示章节标题，MediaWiki 却把它解释为编号列表。

> 1. 1. Geography（地理）
>
> Villers-Chief 位于 Doubs department 东部的 [Jura Mountains](https://en.wikipedia.org/wiki/Jura_Mountains "Jura Mountains")。[...]
>
> 1. 1. History（历史）
>
> 与地区内许多 communes 一样，Villers-Chief 曾以农业为业。[...]
>
> 1. 1. Administration（行政）
>
> Villers-Chief 隶属 [Canton of Valdahon](https://en.wikipedia.org/wiki/Canton_of_Valdahon "Canton of Valdahon") 和 [Arrondissement of Pontarlier](https://en.wikipedia.org/wiki/Arrondissement_of_Pontarlier "Arrondissement of Pontarlier")。[...]
>
> 1. 1. Population（人口）
>
> 几十年来，Villers-Chief 的人口经历过一些波动，[...]

AI 不熟悉 wikitext 和 Wikipedia 模板，常产生错误grammar。一个显著例子是与 Template:AfC submission 有关的乱码，因为新编辑可能向机器人询问怎样提交 Articles for Creation 草稿。

**示例**

注意，这个严重损坏的分类链接，似乎来自 LLM 的 Markdown 解析器用于提供日期信息的代码：

```
[[Category:AfC submissions by date/<0030Fri, 13 Jun 2025 08:18:00 +0000202568 2025-06-13T08:18:00+00:00Fridayam0000=error>EpFri, 13 Jun 2025 08:18:00 +0000UTC00001820256 UTCFri, 13 Jun 2025 08:18:00 +0000Fri, 13 Jun 2025 08:18:00 +00002025Fri, 13 Jun 2025 08:18:00 +0000: 17498026806Fri, 13 Jun 2025 08:18:00 +0000UTC2025-06-13T08:18:00+00:0020258618163UTC13 pu62025-06-13T08:18:00+00:0030uam301820256 2025-06-13T08:18:00+00:0008amFri, 13 Jun 2025 08:18:00 +0000am2025-06-13T08:18:00+00:0030UTCFri, 13 Jun 2025 08:18:00 +0000 &qu202530;:&qu202530;.</0030Fri, 13 Jun 2025 08:18:00 +0000202568>June 2025|sandbox]]
```

### ChatGPT-specific markup: citeturn, iturn

ChatGPT 可能在句末加入 `citeturn0search0`（外面包围 Unicode 私用区字符），且 search 后的数字随文本推进而增大。这些位置本来是聊天机器人链接外部网站的地方；用户把对话粘贴到 Wikipedia 时，链接却变成占位代码。2025 年 2 月首次观察到此现象。

回复中的一组图片也可能显示成 `iturn0image0turn0image1turn0image4turn0image5`。少数情况下，还会出现类似标记，如 `citeturn0news0`、`citeturn1file0`、`citegenerated-reference-identifier`。

**示例**

> 这所学校也是 US College Board examinations、SAT I 和 SAT II 的考点，并获 Cambridge International Examinations 认定为 International Fellowship Centre。citeturn0search1 如需更多信息，可访问其官方网站：citeturn0search0

### Reference markup bugs: contentReference, oaicite, oai_citation, attached_file, grok_card

由于一个 bug，ChatGPT 可能在输出中用 `:contentReference[oaicite:0]{index=0}` 代替参考链接。ChatGPT 生成的参考链接也可能标记为 `oai_citation`。

**示例**

> :contentReference[oaicite:16]{index=16}
>
> 1. **Ethnicity clarification（族属澄清）**
>
> - :contentReference[oaicite:17]{index=17}
>     * :contentReference[oaicite:18]{index=18} :contentReference[oaicite:19]{index=19}.
>     * Denzil Ibbetson 的 *Panjab Castes* 将 Sial 归为 Rajputs :contentReference[oaicite:20]{index=20}。
>     * 历史学家的 blog 指出：“Sial 是 Parmara Rajputs 的一个 clan……” :contentReference[oaicite:21]{index=21}。
> 2. :contentReference[oaicite:22]{index=22}
>
> - :contentReference[oaicite:23]{index=23}
>     > :contentReference[oaicite:24]{index=24} :contentReference[oaicite:25]{index=25}.

> #### Key facts needing addition or correction:
>
> 1. **Group launch & meetings（团体成立与集会）**
>
> *Independent Together* 于 6 月 15 日发起“Zero Rates Increase Roadshow”，在 Karori、Hataitai、Tawa、Newtown 举办活动  [oai_citation:0‡wellington.scoop.co.nz](https://wellington.scoop.co.nz/?p=171473&utm_source=chatgpt.com)。
>
> 2. **Zero-rates pledge and platform（零增税承诺与政纲）**
>
> 该团体承诺三年内不提高 rates，此后仅随 inflation 调整，以回应 Wellington 在 2024/25 年 16.9% 的涨幅  [oai_citation:1‡en.wikipedia.org](https://en.wikipedia.org/wiki/Independent_Together?utm_source=chatgpt.com)。

截至 2025 年秋，已观察到句末出现 `[attached_file:1]`、`[web:1]` 等标签，可能是 Perplexity 特有的。[^12]

> 在他担任 CEO 期间，Philip Morris 的 reputation management 和 media relations 以后来引发争议的方式，将商业与新闻利益结合起来；其影响至今仍在当代 regulatory 和 legal 讨论中引发争论。[attached_file:1]

Grok 生成的文本相对少见，但有时会在引用后出现类似 XML 的 *grok_card* 标签。

> Malik 的成名 凸显（highlights） 了 transgender artists 在 Pakistan entertainment scene 中的可见度，尽管她也因身份而面对社会挑战。[...]<grok-card data-id="e8ff4f" data-type="citation_card">

### attribution and attributableIndex

ChatGPT 可能在句末加入 JSON 格式代码 `({"attribution":{"attributableIndex":"X-Y"}})`，X、Y 为递增的数字索引。

**示例**

> ^[Evdokimova 于 1939 年 10 月 6 日出生于 Ukrainian SSR 的 Kharkov Oblast 的 Osnova，即今 Ukraine 的 Kharkiv。]({"attribution":{"attributableIndex":"1009-1"}}) ^[她于 1963 年毕业于 Gerasimov Institute of Cinematography（VGIK），师从 Mikhail Romm。]({"attribution":{"attributableIndex":"1009-2"}}) [oai_citation:0‡IMDb](https://www.imdb.com/name/nm0947835/?utm_source=chatgpt.com) [oai_citation:1‡maly.ru](https://www.maly.ru/en/people/EvdokimovaA?utm_source=chatgpt.com)

> Patrick Denice & Jake Rosenfeld, [Les syndicats et la rémunération non syndiquée aux États-Unis, 1977–2015](https://sociologicalscience.com/articles-v5-23-541/), ''Sociological Science'' (2018).]({"attribution":{"attributableIndex":"3795-0"}})

### Non-existent or out-of-place categories and "see also" pages

LLM 可能凭空生成不存在的分类：有时是看似合理的通用概念分类或 SEO 关键词，有时是训练资料中已过时、改名的分类。这些会显示为红色链接。也可能出现分类重定向，例如长期被垃圾信息发送者偏爱的 Category:Entrepreneurs。审阅者有时会删除错误分类，所以怀疑页面由 LLM 生成时，值得查看早期修订。

也应留意“see also”标题下的蓝色链接。LLM 生成的相关条目章节，常像完成任务一样填入至少三个链接。如果某个初创公司草稿把 Financial technology 这类宽泛概念放入相关条目，就有些可疑。

当然，本节任何现象都不应视为绝对规则。新用户不太可能了解 Wikipedia 对这些章节的 style guidelines；回归 editors 也可能习惯了那些后来已被删除的旧 categories。

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

> Ohm's Law 是 electrical engineering 和 physics 中的一项基本 principle：只要 temperature 保持不变，conductor 两点之间通过的 current，就与两点之间的 voltage 成正比。数学上写为 V=IR，其中 V 为 voltage，I 为 current，R 为 resistance。该 law 由 German physicist Georg Simon Ohm 于 1827 年提出，是 electrical circuits 分析与设计的基石 [1]。Ohm's Law 适用于许多“ohmic”的 materials 和 components，即它们的 resistance 不随施加的 voltage 或 current 改变。不过，它不适用于 diodes、transistors 等 non-linear devices [2][3]。
>
> References:
>
> 1. Dorf, R. C., & Svoboda, J. A. (2010). Introduction to Electric Circuits (8th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 9780470521571.
>
> 2. M. E. Van Valkenburg, "The validity and limitations of Ohm's law in non-linear circuits," Proceedings of the IEEE, vol. 62, no. 6, pp. 769–770, Jun. 1974. doi:10.1109/PROC.1974.9547
>
> 3. C. L. Fortescue, "Ohm's Law in alternating current circuits," Proceedings of the IEEE, vol. 55, no. 11, pp. 1934–1936, Nov. 1967. doi:10.1109/PROC.1967.6033

书籍引用看似有效：关于 electric circuits 的书很可能包含 Ohm's law 的信息；但没有页码，就无法用这条 citation 核实正文主张。更糟的是，两条 *Proceedings of the IEEE* citations 都是完全编造的。DOI 指向完全不同的 citations，还存在其他问题。例如，[C. L. Fortescue](https://en.wikipedia.org/wiki/Charles_LeGeyt_Fortescue "Charles LeGeyt Fortescue") 在所称写作时间之前已去世 30+ 年，而第 55 卷第 11 期没有任何文章的信息与 reference 3 所列内容哪怕近似相符。

### Incorrect or unconventional use of references

AI 可能被要求加入参考资料，也尝试按 Wikipedia 要求处理，却在关键实现细节上出错，或明显偏离惯例。

**示例**

下例请注意错误的引用复用方式。当时使用的工具不能搜索真实来源（因为时间在 Bing Deep Search 推出前一天），但仍找到了一个真实参考资料；然而复用引用的grammar是错的。

这里的 *Smith, R. J.* 来源——作为“第三个来源”，工具似乎生成了链接 'https://pubmed.ncbi.nlm.nih.gov/3'（其 PMID 为 3）——与正文完全无关。用户将其转成 {{cite journal}} 引用前没有检查，尽管链接确实可以打开。

该例中，LLM 在每个period后都认真附上了错误的复用grammar。

> 三十多年来，computers 一直用于 brain injuries 人群的 rehabilitation。最初，研究者 深入探究（delved into） 开发“prosthetic memory”的潜力。<ref>Fowler R, Hart J, Sheehan M. A prosthetic memory: an application of the prosthetic environment concept. *Rehabil Counseling Bull*. 1972;15:80–85.</ref> 然而到 1980 年代初，重点转向通过反复练习应对 brain dysfunction。<ref>{{Cite journal |last=Smith |first=R. J. |last2=Bryant |first2=R. G. |date=1975-10-27 |title=Metal substitutions incarbonic anhydrase: a halide ion probe study |url=https://pubmed.ncbi.nlm.nih.gov/3 |journal=Biochemical and Biophysical Research Communications |volume=66 |issue=4 |pages=1281–1286 |doi=10.1016/0006-291x(75)90498-2 |issn=0006-291X |pmid=3}}</ref> 当时只有少数 psychologists 为 Traumatic Brain Injury（TBI）人群开发 rehabilitation software，因此可用 programs 稀少。<sup>[3]</sup> Cognitive rehabilitation specialists 选用市售 computer games，它们视觉吸引力强、能吸引参与、具有重复性且有娱乐性；专家据此推测它们可能对 neuropsychological dysfunction 具有补救作用。<sup>[3]</sup>

某些 LLM 或聊天界面用 ↩ 表示脚注：

> References
>
> 你希望我帮助排版并提交到 Wikipedia，还是准备自己发布？这些步骤我也可以逐步指导你完成。
>
> **Footnotes**
>
> 1.   KLAS Research. (2024). *Top Performing RCM Vendors 2024*. https://klasresearch.com ↩ ↩2
> 2.   PR Newswire. (2025, February 18). *CureMD AI Scribe Launch Announcement*. https://www.prnewswire.com/news-releases/curemd-ai-scribe ↩

### ChatGPT-specific UTM parameters

ChatGPT 可能给来源 URL 添加 [UTM 参数](https://en.wikipedia.org/wiki/UTM_parameter "UTM parameter") `utm_source=openai`，或在 2025 年 8 月之前的编辑中添加 `utm_source=chatgpt.com`。Gemini、Claude 等其他 LLM 较少使用这类参数。[^13]

注意：这可以明确证明 ChatGPT 参与过，却不能单独证明文字也由它生成。有些编辑只用 AI 为已有文字找来源；编辑历史可以体现这一点。

**示例**

> 婚后，Burgess 和 Graham 定居于 England 的 Cheshire；Burgess 在那里担任 Warrington Wolves rugby league team 的 head coach。[https://www.theguardian.com/sport/2025/feb/11/sam-burgess-interview-warrington-rugby-league-luke-littler?utm_source=chatgpt.com]

> Vertex AI 文档和 blog posts 描述了 watermarking、verification workflow 和可配置的 safety filters，例如 person‑generation controls 与 safety thresholds。([cloud.google.com](https://cloud.google.com/vertex-ai/generative-ai/docs/image/generate-images?utm_source=openai))

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

编辑的文风突然改变，例如相较其他交流突然grammar完美，可能意味着使用 AI。

### Sudden shift in English variety use

用户所在地、主题对应的英语变体和实际采用的英语变体不一致，可能暗示使用 AI。例如印度作者写印度大学，通常不会使用美式英语；LLM 若无特别提示，默认却多用美式英语。[^9] 注意，非英语母语者也容易混用英语变体；只有突然、彻底切换时，才应据此怀疑。

### Overwhelmingly verbose edit summaries

AI 生成的[编辑摘要](https://en.wikipedia.org/wiki/Help:Edit_summary "Help:Edit summary")常异常冗长，用正式、第一人称的段落，不使用缩写，或明显逐项罗列 Wikipedia 惯例。

> 润色条目语言，使其呈现符合 Wikipedia 内容指引的中立百科语气。删除宣传措辞，确保事实准确，并保持清晰、组织良好的呈现。更新 history、coverage、challenges、recognition 章节，提高清晰度与相关性。加入适当格式，并相应地为条目分类

> 我将语气正式化，澄清 technical content，确保 neutrality，并标示需要 citation 的地方。精简 historical narratives，以 regulatory references 明确 allocation details，让 propagation explanations 更易读，并将 equipment discussions 聚焦于 availability 和 regulatory compliance，同时始终遵循 encyclopedic standards。

> **简洁的 edit summary：** 改善 plot 章节的清晰度、衔接与可读性；减少冗余，调整语气，使之更符合 encyclopedic style。

### "Submission statements" in AFC drafts

这专门涉及通过 Articles for Creation 提交的 drafts。至少一种 LLM 倾向插入“submission statements”，据称是给 reviewers 看的，也据称能解释主题为何具有 notability、草稿为何符合 Wikipedia guidelines。当然，这实际只会让 reviewers 知道草稿由 LLM 生成，并认为应不加思索地被 declined 或 speedied。

> Reviewer note（供 AfC 使用）：这份草稿是关于 Portuguese public manager Jorge Patrão 的中立且来源充分的 biography。全部 references 均来自独立、可靠的 sources（Público、Diário de Notícias、Jornal de Negócios、RTP、O Interior、Agência Lusa），涵盖其公共事业和文化活动。它符合 WP:RS、WP:BLP 标准，并通过以下经历明确展示符合 WP:NBIO 的 notability：– 担任 Serra da Estrela Tourism Region 主席（1998–2013）；– 担任 Parkurbis – Covilhã Science and Technology Park 主席；– 创立 Rede de Judiarias de Portugal（Council of Europe 的 European Routes of Jewish Heritage 成员）中的作用；– 著作“1677 – A Fábrica d'El-Rei”；– Beatriz de Luna Art Collection（以 Old Master 为重点）的创办人及 curator。pt.wikipedia.org/wiki/Jorge_Patrão 还有这篇条目的 Portuguese 版本。感谢审阅。 -->

— 位于 Draft:Jorge Patrão 的顶部（那些免不了出现的 formatting errors，全都存在于原文）

### Pre-declined AFC review templates

新 editor 偶尔会创建已带“declined”状态 AFC review template 的 draft；template 同时没有内容，也没有 reviewer reasoning。LLM 似乎是提议为 draft 添加 AFC submission template，随后给出类似 `{{AfC submission|d}}` 的内容；其中 d 参数通过 substituting {{AfC submission/declined}}，预先将 draft 标为 declined。contribution history 显示，这个 template 在某个时点由 draft 创建者加入。创建者随后总会到 Wikipedia:WikiProject Articles for creation/Help desk 或其他 help page，询问为何没有 feedback 就被 declined。无内容的“submission declined”header，是 LLM-generated draft 的**强烈**迹象。

---

## Signs of Human Writing

### Age of text relative to ChatGPT launch

ChatGPT 于 2022 年 11 月 30 日向公众推出。此前 OpenAI 虽然有能力相近的 LLM，但它们付费、普通人不易接触，也不广为人知。ChatGPT 上线后立即迅速增长。

Wikipedia 在 **2022 年 11 月 30 日之前**加入的任何特定文字，都极不可能由 LLM 生成。如果编辑早于该日，可以排除该版本使用 AI。旧文字也可能恰好出现本清单的一些迹象，甚至很像 AI 生成，但 Wikipedia 的规模足以容纳这些罕见巧合。

### Ability to explain one's own editorial choices

编辑应该能够解释自己为什么作出某次编辑或犯错。例如发现疑似编造的 URL，可先询问发生了什么，而非急于下结论。如果对方能给出正确链接、解释人为失误（如拼写错误），或提供真实来源的相关段落，就更像普通的人类错误。

---

## Ineffective Indicators

对 AI 使用的错误指控，可能 [赶走新 editors](https://en.wikipedia.org/wiki/Wikipedia:BITE "Wikipedia:BITE")，并形成相互猜疑的氛围。声称使用 AI 前，应考虑 [Dunning–Kruger effect](https://en.wikipedia.org/wiki/Dunning%E2%80%93Kruger_effect "Dunning–Kruger effect")、[confirmation bias](https://en.wikipedia.org/wiki/Confirmation_bias "Confirmation bias") 是否正在干扰判断。以下几个相当常用的 indicators，对 LLM detection 无效，甚至可能说明相反情况。

- **grammar完美**：现代 LLM grammar能力强，但许多编辑也擅长写作或有专业背景。（另见[文风和英语变体不一致](#discrepancies-in-writing-style-and-variety-of-english)。）

- **“平淡”或“机械”的文字**：如前文所述，现代 LLM 默认更倾向热情洋溢且冗长。虽有套路，不熟悉 AI 写作的人却未必觉得它机械。[^14]

- **“华丽”“学术”或生僻词**：LLM 偏爱某些词句，其中很多很长、可读性较差，但这种相关性不适用于*所有*显得华丽、学术或高级的文字。[^1] 低频、生僻词在统计上少见，反而不容易出现在 AI 文字中，直接相关的专名除外。

- **单独的书信形式**：2023 年之后，含称呼、落款、主题等格式的讨论页消息，常显得像 AI；但书信和邮件*早在*现代 LLM 之前就采用这些惯例。人类编辑，尤其新人，也可能因习惯正式交流、课程要求，或误把讨论页当邮件而这样排版。AI 生成的消息往往还有纵向列表、[^d] 占位符或突然截断等其他迹象。

- **单独的连接词**：LLM 常机械、公式化地过度使用连接词，暗示不适当的事实综合，但人类议论文也常这样写，本身不是强烈迹象。

- **古怪的 wikitext**：如[使用 Markdown](#use-of-markdown)所述，LLM 可能编造模板或错误grammar，但不太容易产生某些随机、难以解释的错误与残留（本页[标记](#markup)所列除外）。莫名其妙的 `<span>` 等 HTML 标签，更像浏览器扩展编程不佳，或 Wikipedia 内容翻译工具的已知 bug（T113137）。`''Catch-22 i''s a satirical novel.`（渲染为“*Catch-22 i* s a satirical novel.”）等错位grammar，更像 VisualEditor 失误，因为在可视化编辑中比源码编辑更难察觉。

---

## Notes

[^a]: 并非 AI chatbots 独有；也会由 {{as of}} template 生成

[^b]: 已删除草稿中 `Would you like me to ... turn this into actual Wikipedia markup format (wikitext)?` 的示例（仅 administrators 可查看）

[^c]: 草稿中 ` ```wikitext ` 的示例。

[^d]: deletion discussion 中 vertical list 的示例

---

## References

[^1]: Russell, Jenna; Karpinska, Marzena; Iyyer, Mohit (2025). [*People who frequently use ChatGPT for writing tasks are accurate and robust detectors of AI-generated text*](https://aclanthology.org/2025.acl-long.267/). Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers). Vienna, Austria: Association for Computational Linguistics. pp.5342–5373. arXiv:[2501.15654](https://arxiv.org/abs/2501.15654).

[^2]: Dugan, Liam; Hwang, Alyssa; Trhlik, Filip; Zhu, Andrew; Ludan, Josh Magnus; Xu, Hainiu; Ippolito, Daphne; Callison-Burch, Chris (2024). [*RAID: A Shared Benchmark for Robust Evaluation of Machine-Generated Text Detectors*](https://aclanthology.org/2024.acl-long.674). Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers). Bangkok, Thailand: Association for Computational Linguistics. pp.12463–12492. arXiv:[2405.07940](https://arxiv.org/abs/2405.07940).

[^3]: ["People who frequently use ChatGPT for writing tasks are accurate and robust detectors of AI-generated text"](https://arxiv.org/html/2501.15654v2). *arxiv.org*. Retrieved 2025-11-28.

[^4]: 直接检查 text-to-image models 生成的图片，就能观察到这一点：乍看可以接受，但具体细节往往模糊、畸形，背景物体和文字尤其如此。

[^5]: ["10 Ways AI Is Ruining Your Students' Writing"](https://www.chronicle.com/article/10-ways-ai-is-ruining-your-students-writing). *Chronicle of Higher Education*. September 16, 2025. Archived from the original on October 1, 2025. Retrieved October 1, 2025.

[^6]: Juzek, Tom S.; Ward, Zina B. (2025). [*Why Does ChatGPT "Delve" So Much? Exploring the Sources of Lexical Overrepresentation in Large Language Models*](https://aclanthology.org/2025.coling-main.426.pdf) (PDF). Findings of the Association for Computational Linguistics: ACL 2025. Association for Computational Linguistics. arXiv:[2412.11385](https://arxiv.org/abs/2412.11385).

[^7]: Reinhart, Alex; Markey, Ben; Laudenbach, Michael; Pantusen, Kachatad; Yurko, Ronald; Weinberg, Gordon; Brown, David West. ["Do LLMs write like humans? Variation in grammatical and rhetorical styles"](http://arxiv.org/abs/2410.16107). Retrieved 4 December 2025.

[^8]: Kobak, Dmitry; González-Márquez, Rita; Horvát, Emőke-Ágnes; Lause, Jan (2 July 2025). ["Delving into LLM-assisted writing in biomedical publications through excess vocabulary"](https://www.science.org/doi/10.1126/sciadv.adt3813). *Science Advances*. **11** (27). doi:[10.1126/sciadv.adt3813](https://doi.org/10.1126%2Fsciadv.adt3813). ISSN 2375-2548. PMC 12219543. PMID 40009654.

[^9]: Ju, Da; Blix, Hagen; Williams, Adina (2025). [*Domain Regeneration: How well do LLMs match syntactic properties of text domains?*](https://aclanthology.org/2025.findings-acl.120). Findings of the Association for Computational Linguistics: ACL 2025. Vienna, Austria: Association for Computational Linguistics. pp.2367–2388. arXiv:[2505.07784](https://arxiv.org/abs/2505.07784). doi:[10.18653/v1/2025.findings-acl.120](https://doi.org/10.18653%2Fv1%2F2025.findings-acl.120).

[^10]: Kousha, Kayvan; Thelwall, Mike (2025). [*How much are LLMs changing the language of academic papers after ChatGPT? A multi-database and full text analysis*](https://arxiv.org/pdf/2509.09596). ISSI 2025 Conference. arXiv:[2509.09596](https://arxiv.org/abs/2509.09596).

[^11]: Merrill, Jeremy B.; Chen, Szu Yu; Kumer, Emma (13 November 2025). ["What are the clues that ChatGPT wrote something? We analyzed its style"](https://www.washingtonpost.com/technology/interactive/2025/how-detect-chatgpt-em-dash/). *The Washington Post*. Retrieved 14 November 2025.

[^12]: ["Unproductive Interpretation of Work and Employment as Misinformation?"](https://www.laetusinpraesens.org/docs20s/workeco.php). Archived from the original on 2 September 2025. Retrieved 21 October 2025.

[^13]: 见 [T387903](https://phabricator.wikimedia.org/T387903 "phabricator:T387903")。

[^14]: Murray, Nathan; Tersigni, Elisa (21 July 2024). ["Can instructors detect AI-generated papers? Postsecondary writing instructor knowledge and perceptions of AI"](https://journals.sfu.ca/jalt/index.php/jalt/article/view/1895). *Journal of Applied Learning & Teaching*. **7** (2). doi:[10.37074/jalt.2024.7.2.12](https://doi.org/10.37074%2Fjalt.2024.7.2.12). ISSN 2591-801X. Retrieved 21 November 2025.

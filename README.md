AI 架构 - Kairos 指南针
🤖 双模型 AI 架构
我们使用 两个 ModelScope 模型 以实现最佳性能：

主要模型：Qwen-Max
深度职业分析与匹配

复杂推理与解释

高精度，速度稍慢

次要模型：Qwen-2.5-7B-Instruct
快速主题提取与过滤

快速初步匹配

高效的资源利用

工作流程：
快速模型：快速主题提取与初步过滤

如果匹配度低：提前返回（节省 API 成本）

如果匹配度好：传递给 Qwen-Max 进行深度分析

结果：更快的响应 + 更好的资源使用

🏗️ 系统设计
text
┌─────────────────────────────────────────┐
│ 前端 (Next.js 15)                       │
├─────────────────────────────────────────┤
│ API 层 (FastAPI + ModelScope SDK)       │
├─────────────────────────────────────────┤
│ 职业数据库 (Firebase + JSON 文件)       │
└─────────────────────────────────────────┘
数据流程
用户输入 → ModelScope Qwen-ASR（用于语音转文本）

处理的个人资料 → ModelScope Qwen-Max（用于分析与主题提取）

职业匹配 → 本地 JSON 关键词搜索 + AI 驱动评分

计划生成 → Qwen-Max 的提示工程响应

🎯 让我们脱颖而出的独特功能
1. ⏳ 自适应演化引擎
与学生一起成长（不是静态的一次性测试）

随着技能/兴趣的发展更新推荐

维护从高中 → 大学 → 职业的职业旅程时间线

2. 🌍 实时神经网络翻译器
无缝的英文 ↔ 中文翻译集成在 UI 层

上下文感知的职业术语映射（非字面翻译）

两种语言的语音输入/输出

针对地区就业市场的本地化内容适配

3. 🎓 教育级别智能
针对高中、大学、研究生的不同算法

适合年龄的推荐和语言

路径感知规划（4年制、2年制、博士轨道）

4. 🌐 实时机会整合
实时竞赛/实习匹配

本地化就业市场数据

所选职业路径的月度“领域动态”更新

📁 额外资源
观看我们的演示视频：
📹 Google Drive 演示




English:
AI Architecture - Kairos Compass
🤖 Dual-Model AI Architecture
We use two ModelScope models for optimal performance:

Primary Model: Qwen-Max
Deep career analysis and matching

Complex reasoning and explanations

High accuracy, slightly slower

Secondary Model: Qwen-2.5-7B-Instruct
Quick theme extraction and filtering

Fast preliminary matching

Efficient resource usage

Workflow:
Fast Model: Quick theme extraction & initial filtering

If poor match: Return early (saves API costs)

If potential match: Pass to Qwen-Max for deep analysis

Result: Faster responses + better resource usage

🏗️ System Design
text
┌─────────────────────────────────────────┐
│ Frontend (Next.js 15)                   │
├─────────────────────────────────────────┤
│ API Layer (FastAPI + ModelScope SDK)    │
├─────────────────────────────────────────┤
│ Career DB (Firebase + JSON files)       │
└─────────────────────────────────────────┘
Data Flow
User Input → ModelScope Qwen-ASR (for speech-to-text)

Processed Profile → ModelScope Qwen-Max (for analysis and theme extraction)

Career Matching → Local JSON keyword search + AI-driven scoring

Plan Generation → Prompt-engineered responses from Qwen-Max

🎯 UNIQUE FEATURES THAT SET US APART
1. ⏳ Adaptive Evolution Engine
Grows WITH the student (not static one-time test)

Updates recommendations as skills/interests evolve

Maintains career journey timeline from HS → College → Career

2. 🌍 Real-Time Neural Translator
Seamless EN ↔ CN translation integrated at UI layer

Context-aware career term mapping (not literal translation)

Voice input/output in both languages

Localized content adaptation for regional job markets

3. 🎓 Education-Level Intelligence
Different algorithms for HS vs College vs Graduate students

Age-appropriate recommendations and language

Pathway-aware planning (4-year, 2-year, PhD tracks)

4. 🌐 Live Opportunity Integration
Real-time competition/internship matching

Localized job market data

Monthly "field pulse" updates in chosen career paths

📁 Additional Resources
Watch Our Demo Video:
📹 Google Drive Demo

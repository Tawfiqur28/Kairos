# AI Architecture - Kairos Compass

## 🤖 Dual-Model AI Architecture

We use **two ModelScope models** for optimal performance:

### **Primary Model: Qwen-Max**
- Deep career analysis and matching
- Complex reasoning and explanations
- High accuracy, slightly slower

### **Secondary Model: Qwen-2.5-7B-Instruct** 
- Quick theme extraction and filtering
- Fast preliminary matching
- Efficient resource usage

### **Workflow:**
1. **Fast Model**: Quick theme extraction & initial filtering
2. **If poor match**: Return early (saves API costs)
3. **If potential match**: Pass to Qwen-Max for deep analysis
4. **Result**: Faster responses + better resource usage

## 🏗️ System Design
```
┌─────────────────────────────────────────┐
│ Frontend (Next.js 15)                   │
├─────────────────────────────────────────┤
│ API Layer (FastAPI + ModelScope SDK)    │
├─────────────────────────────────────────┤
│ Career DB (Firebase + JSON files)       │
└─────────────────────────────────────────┘
```
### Data Flow
1.  **User Input** → ModelScope Qwen-ASR (for speech-to-text)
2.  **Processed Profile** → ModelScope Qwen-Max (for analysis and theme extraction)
3.  **Career Matching** → Local JSON keyword search + AI-driven scoring
4.  **Plan Generation** → Prompt-engineered responses from Qwen-Max

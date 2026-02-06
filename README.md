# AI Architecture - Kairos Compass

This document outlines the AI agents and system design that power the Kairos Compass application.

## 🤖 Our AI Architecture

### **Career Analyst Agent**
*(Implemented via ModelScope Qwen-Max)*
- Analyzes Ikigai profile themes
- Calculates multi-dimensional fit scores
- Identifies theme mismatches

### **Education Planner Agent**
*(Implemented via custom prompt engineering)*
- Generates education-level specific 3-year plans
- Tailors milestones to HS/College/Masters/PhD
- Provides stage-appropriate resources

### **Market Intelligence Agent**
*(Implemented via monthly updates feature)*
- Curates field-specific opportunities
- Tracks competitions by education level
- Provides localized job market insights

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

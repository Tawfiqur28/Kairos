# **App Name**: Kairos Compass

## Core Features:

- Ikigai Canvas: Interactive canvas to input passions, skills, values, and interests.
- Voice and Text Input: ModelScope Speech Recognition for voice input; ModelScope text generation for journal entry processing.
- AI Career Match: AI (ModelScope LLM tool) analyzes inputs and matches user profiles against careers with personalized explanations for fit and quiz. Uses a list of starter careers stored in JSON.
- Dynamic Plan: AI-generated (ModelScope LLM tool) dynamic, step-by-step, 3-year personalized action plan presented as a timeline or checklist. After fit or quiz, if the answer is computer science, and the user is an undergrad student, suggest this major, then software or cloud computing or cyber security in master. Be more specific and provide step-by-step guidelines.
- User Profile Management: Create, update, and manage user profiles. Uses automation to pre-fill similar fields with past answers.
- Data Persistence: Save user profiles, journal entries, and generated plans in the database. Allow users to express their daily feelings and use this data to give them career suggestions for future analysis.
- Simplified UX Flows: Reduce clicks needed for main actions using localstorage-stored settings where possible and reasonable.
- Learn More Page: A 'Learn More' section on the front page that explains how the app works and how to use it.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to evoke trust, stability, and intelligence, reflecting the app's purpose in guiding career choices.
- Background color: Light blue-gray (#ECEFF1), a desaturated version of the primary hue for a calm and neutral backdrop.
- Accent color: Yellow-orange (#FFB300), an analogous color with increased brightness and saturation to draw attention to key interactive elements.
- Body and headline font: 'Inter', a grotesque-style sans-serif with a modern look suitable for both headlines and body text.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use clean, minimalist icons to represent different aspects of the Ikigai framework.
- Subtle animations to create a dynamic and engaging user experience, such as smooth transitions between sections.
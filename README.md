# StudyMind AI — Your Personal Study Space

A full-stack, AI-powered learning companion web application built with React 19, TypeScript, Express, Tailwind CSS, and the Google Gemini API (`gemini-3.8-flash`).

StudyMind AI combines intelligent tutoring, speech synthesis, 100 original audio stories, academic notes synthesis from PDFs, an interactive exam simulator, and real-time RSS daily news into a cohesive, purple-themed personal workspace.

---

## 🌟 Key Features

### 1. 🤖 AI Study Assistant
- **Conversational Intelligence:** Powered by Google's Gemini 3.8 Flash model via a secure server-side proxy (API keys are never exposed to the client).
- **Multi-Turn Context:** Retains multi-turn conversation context across interactions.
- **Trilingual Language Support:** Supports Simple English, Telugu (తెలుగు), and bilingual Telugu + English (Tanglish) responses.
- **Voice Capabilities:** In-browser Speech Recognition (dictation) with pulsing feedback, and Speech Synthesis (Read Aloud) with playback controls.
- **Quick Actions:** Copy answers with feedback, regenerate responses, and quick starter prompts across science, math, code, and regional topics.

### 2. 💬 ChatGPT-Style Chat History
- Unique ID generation per conversation.
- Automatic smart title generation from initial user queries.
- Searchable conversation archive filtering by title and content.
- Reopen, rename, or delete past sessions with confirmation dialogs.
- Isolated storage partitions per user profile.

### 3. 📚 100 Stories & Audio Book Library
- **Exactly 100 Original Mini-Stories (Numbered 1–100):**
  1. *Love Stories* (#1 – #20)
  2. *Moral Stories* (#21 – #40)
  3. *Women Empowerment* (#41 – #60)
  4. *Inspirational and Life Stories* (#61 – #75)
  5. *Telugu Kathalu, Family & Mystery* (#76 – #100)
- **Story Reader & Player:** Full narrative text, morals, text size controls (`A-`, `A`, `A+`), speed adjustment (`0.9x`, `1.0x`, `1.25x`), Play/Pause/Stop speech synthesis, and previous/next navigation.
- **Public-Domain Classics Section:** Curated collection of 9 timeless classics (Aesop's Fables, Alice in Wonderland, Sherlock Holmes, Meditations, Art of War, etc.) with verified Project Gutenberg links.

### 4. 📝 Smart Notes Generator
- Synthesizes structured revision notes from topics or pasted study material.
- **PDF Extraction:** Server-side PDF parsing extracts text from syllabus and lecture documents up to 15MB.
- **Configurable Formats:** Detailed notes, concise cheat sheets, or exam-oriented key points with practice questions.
- **Export:** Copy to clipboard or download as formatted `.md` text files.

### 5. 🎓 Interactive Exam Simulator
- Configurable by subject, topic, difficulty (Easy, Medium, Hard), and question count (5, 10, 15).
- Real multiple-choice question generation with 4 options per question.
- Active test session timer, navigation between questions, and score calculations.
- Comprehensive review mode highlighting correct keys and detailed pedagogical explanations.
- Exam history tracking per user profile.

### 6. 📰 Daily News & Newspaper Directory
- **Live RSS News:** Real-time headlines categorized into India, AP & Telangana, World, Tech & AI, Education, and Science.
- **Verified Sources:** Pulls from Google News India, The Hindu, Times of India, and BBC News with relative timestamps and original article links.
- **Newspaper Directory:** Verified links to official e-papers:
  - Eenadu
  - Sakshi
  - Andhra Jyothy
  - The Hindu
  - The Indian Express
  - Hindustan Times
  - The Times of India
  - BBC News

### 7. 🔐 User Profiles & Privacy
- Dedicated user profiles with isolated conversation and exam data.
- Built-in Local Storage partition for zero-configuration privacy, with ready hooks for Firebase Authentication and Cloud Firestore sync.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Backend:** Express, Node.js (`tsx`)
- **AI Integration:** `@google/genai` TypeScript SDK (`gemini-3.8-flash`)
- **Document Processing:** `pdf-parse`
- **News Aggregation:** `rss-parser`
- **Speech:** Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (version 20 or higher)
- npm (version 9 or higher)
- A Google Gemini API key (obtain from [Google AI Studio](https://aistudio.google.com/))

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd studymind-ai

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your variables in `.env`:
```env
# Required for Gemini AI features:
GEMINI_API_KEY="your_actual_gemini_api_key_here"

# Server Port:
PORT=3000
```

### 4. Running the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### 5. Building for Production
```bash
npm run build
npm start
```

---

## 📦 GitHub Deployment Instructions

1. Initialize git and commit:
```bash
git init
git add .
git commit -m "Initial commit: StudyMind AI full learning platform"
```

2. Link to your GitHub repository:
```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

*(Note: Sensitive files such as `.env` and `node_modules/` are automatically excluded via `.gitignore`.)*

---

## 📄 License
Apache-2.0

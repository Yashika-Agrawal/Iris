# Iris - AI Chief of Staff 🚀

**Built for the Corsair x ChaiCode Hackathon**

Iris is an AI-first Executive Assistant that turns your live Gmail and Google Calendar into a dynamic data layer. Instead of manually checking your schedule and digging through email threads to figure out what you need to do, Iris automatically synthesizes your communication and schedule into actionable intelligence.

## ✨ Core Features

- **📊 Daily Briefing Workspace:** Automatically analyzes your unread emails and today's schedule to generate a prioritized list of action items, follow-ups, and urgent tasks.
- **✉️ Smart Inbox:** A contextual email viewer that automatically extracts open questions, action items, and summarizes long threads.
- **📅 Meeting Prep Intelligence:** Prepares you for upcoming meetings by pulling relevant emails, surfacing unresolved commitments, and generating a snapshot of your relationship with the participants.
- **🧠 Follow-up AI / Relationship Intelligence:** Analyzes your communication patterns to track who you interact with the most, calculating when you last spoke and finding pending commitments.
- **💬 AI Command Center:** A ChatGPT-style floating command palette that allows you to query your live data and execute commands (e.g. "Draft a reply to Rohan", "Do I have any conflicts today?").

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, TailwindCSS, Framer Motion
- **Integrations:** [Corsair Platform](https://corsair.dev) (Live OAuth integrations for Gmail and Google Calendar)
- **AI / LLM:** OpenAI (`gpt-4o-mini`) via Vercel AI SDK (`@ai-sdk/openai`)
- **Icons:** Tabler Icons

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Corsair account with a configured Project
- OpenAI API Key

### Installation

1. Clone the repository and navigate to the client directory:
```bash
git clone https://github.com/yourusername/iris-ai-assistant.git
cd iris-ai-assistant/client
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create a `.env.local` file in the `client` directory and add your keys:
```env
# Corsair API Configuration
CORSAIR_PROJECT_ID=your_project_id
CORSAIR_API_KEY=your_corsair_api_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key
```

4. Start the development server:
```bash
npm run dev
# or
pnpm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 💡 How the Corsair Integration Works

Iris relies on the **Corsair Platform** to seamlessly manage OAuth handshakes and multi-tenant data synchronization. 
When a user connects their Gmail or Google Calendar from the Iris Settings page, Corsair handles the Google OAuth flow and provisions a seamless, authorized proxy.

We use a background `tenant_id` to scope API calls, allowing the AI engine to fetch the exact email threads and calendar events for the active user without having to build complex custom OAuth logic.

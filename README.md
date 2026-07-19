# SprintPilot AI ✨

SprintPilot is an intelligent Hackathon Co-pilot designed to guide teams through the chaos of a 24-hour hackathon. It helps you prioritize features, validate your problem statement, log architectural decisions, and practice your pitch with a simulated judge.

## Problem Statement and Proposed Solution

### The Problem
During hackathons, teams often fail not because they lack technical skills, but because of poor execution. Common pitfalls include:
- **Scope Creep**: Building complex features that don't add demo value.
- **Unvalidated Problems**: Solving problems that users don't actually care about.
- **Presentation Failure**: Freezing up during the 2-minute pitch or failing to explain the "why".
- **Communication Breakdown**: Missing teammates or stepping on each other's toes in the codebase.

### Our Solution
SprintPilot acts as your YC mentor, project manager, and presentation coach all in one. 
- **AI Coach**: Ask tactical questions and receive blunt, constructive advice on how to unblock your team.
- **Judge Simulator**: Pitch your project to different AI personas (The VC, The Tech Evaluator, The User Advocate) to identify weak spots in your presentation.
- **Scope Guardian**: Categorize features using the MoSCoW method to ruthlessly prioritize your MVP.
- **Phase Roadmap**: A structured timeline ensuring your team ships on time.
- **Problem Reality Check**: A dynamic validation step to ensure you are solving a real, painful problem.

## Tech Stack

SprintPilot is built as a **Full-Stack Application** using a modern, lightweight tech stack:

- **Frontend**: React 19, TypeScript, and Vite
- **Styling**: Vanilla CSS with custom CSS Variables for a glassmorphic UI and seamless Dark Mode
- **State Management**: React Context (`AppContext`) combined with Local Storage persistence hooks
- **Routing**: React Router (`react-router-dom`)
- **Backend Proxy**: Node.js and Express.js
- **Artificial Intelligence**: Google Gemini API (`gemini-2.5-flash`) via direct API calls
- **Concurrency**: `concurrently` (for running the frontend and backend in a single terminal)

## Implementation Details

### 1. Unified Global State & Local Persistence
Because hackathon environments are chaotic (browsers accidentally get closed, laptops run out of battery), SprintPilot persists all session data—including team names, decision logs, AI chat history, and phase progress—directly to the browser's `localStorage` using a custom `useLocalStorage` hook.

### 2. Secure Backend Proxy
To protect the Gemini API key, the application uses a Node.js Express backend (`server/index.js`). The Vite frontend is configured with a proxy (`vite.config.ts`) that intercepts all requests starting with `/api` and forwards them to the Express server. The server then securely injects the API key from a `.env` file before calling the Google Gemini API.

### 3. Dynamic AI Personas
The AI integration goes beyond simple keyword matching. 
- The **Judge Simulator** dynamically constructs system prompts based on the selected judge's persona (e.g., instructing the LLM to act as a "Hardcore VC" who demands revenue numbers).
- The **Problem Check** evaluates the user's answers and generates targeted, single-sentence pushback to ensure they aren't relying on "gut feeling".

### 4. Component Architecture
- **Layout Shell**: A persistent `Sidebar` and `TopBar` wrap the main application.
- **Quick Actions FAB**: A floating action button allows users to rapidly access core tools (like the AI Coach or Decision Journal) without losing their context.
- **Responsive & Premium Design**: The UI features sleek micro-animations, transparent glassmorphic panels, and a cohesive color palette designed to look incredible out of the box.

---
*Built for the Summer of Codefest 2.0 Vanguards Hackathon.*
